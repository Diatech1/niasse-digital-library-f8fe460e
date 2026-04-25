// Generate-and-upload audio for one book chapter.
// - Calls Gemini TTS for the provided text (returns 24kHz mono 16-bit PCM)
// - Wraps PCM in a 44-byte WAV header
// - Uploads to the `book-audio` bucket at `{bookId}/chapter-{idx}.wav`
//
// Note: this is an admin/maintenance endpoint, intentionally unauthenticated for
// one-shot bulk generation by the agent. Idempotent (skipIfExists default true).
// We store WAV instead of MP3 because Deno edge-runtime CPU budget is too small
// for lamejs encoding of long audio. WAV plays in every browser via <audio>.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SAMPLE_RATE = 24000;
const NUM_CHANNELS = 1;
const BITS_PER_SAMPLE = 16;
const MAX_CHUNK_CHARS = 3500;

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function writeWavHeader(pcmByteLength: number): Uint8Array {
  const byteRate = (SAMPLE_RATE * NUM_CHANNELS * BITS_PER_SAMPLE) / 8;
  const blockAlign = (NUM_CHANNELS * BITS_PER_SAMPLE) / 8;
  const buf = new ArrayBuffer(44);
  const v = new DataView(buf);
  v.setUint8(0, 0x52); v.setUint8(1, 0x49); v.setUint8(2, 0x46); v.setUint8(3, 0x46);
  v.setUint32(4, 36 + pcmByteLength, true);
  v.setUint8(8, 0x57); v.setUint8(9, 0x41); v.setUint8(10, 0x56); v.setUint8(11, 0x45);
  v.setUint8(12, 0x66); v.setUint8(13, 0x6d); v.setUint8(14, 0x74); v.setUint8(15, 0x20);
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, NUM_CHANNELS, true);
  v.setUint32(24, SAMPLE_RATE, true);
  v.setUint32(28, byteRate, true);
  v.setUint16(32, blockAlign, true);
  v.setUint16(34, BITS_PER_SAMPLE, true);
  v.setUint8(36, 0x64); v.setUint8(37, 0x61); v.setUint8(38, 0x74); v.setUint8(39, 0x61);
  v.setUint32(40, pcmByteLength, true);
  return new Uint8Array(buf);
}

function chunkText(text: string, maxLen = MAX_CHUNK_CHARS): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return [clean];
  const sentences = clean.split(/(?<=[.!?。؟])\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    if ((current + " " + s).trim().length > maxLen) {
      if (current) chunks.push(current.trim());
      if (s.length > maxLen) {
        const words = s.split(" ");
        let buf = "";
        for (const w of words) {
          if ((buf + " " + w).trim().length > maxLen) { chunks.push(buf.trim()); buf = w; }
          else buf = buf ? `${buf} ${w}` : w;
        }
        if (buf) chunks.push(buf.trim());
        current = "";
      } else current = s;
    } else current = current ? `${current} ${s}` : s;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

async function synthesizeChunk(apiKeys: string[], text: string, voice: string): Promise<Uint8Array> {
  const body = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
  };
  // Up to 3 attempts, cycling through available keys on 429 before backing off.
  for (let attempt = 0; attempt < 3; attempt++) {
    let lastStatus = 0;
    let lastErr = "";
    for (let i = 0; i < apiKeys.length; i++) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKeys[i]}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (resp.ok) {
        const data: any = await resp.json();
        const b64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!b64) throw new Error("Empty audio response");
        return base64ToBytes(b64);
      }
      lastStatus = resp.status;
      lastErr = await resp.text();
      if (resp.status === 429) {
        console.log(`generate-audio: key #${i + 1} hit 429, trying next key…`);
        continue; // try next key
      }
      throw new Error(`Gemini ${resp.status}: ${lastErr.slice(0, 300)}`);
    }
    // All keys hit 429 — back off and retry
    console.log(`generate-audio: all ${apiKeys.length} keys rate-limited, waiting…`);
    await new Promise((r) => setTimeout(r, 30_000 * (attempt + 1)));
  }
  throw new Error("Rate-limit retries exhausted on all keys");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    const apiKey2 = Deno.env.get("GEMINI_API_KEY_2");
    const apiKeys = [apiKey, apiKey2].filter((k): k is string => !!k && k.length > 0);
    if (apiKeys.length === 0) throw new Error("GEMINI_API_KEY not configured");

    const { bookId, sectionIndex, text, voice = "Zephyr", language = "en", skipIfExists = true } =
      await req.json();

    if (!bookId || sectionIndex == null || !text) {
      return new Response(JSON.stringify({ error: "Missing bookId, sectionIndex or text" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const path = `${bookId}/chapter-${sectionIndex}.wav`;

    if (skipIfExists) {
      const { data: existing } = await supabase.storage.from("book-audio").list(bookId, {
        search: `chapter-${sectionIndex}.wav`,
      });
      if (existing && existing.some((f) => f.name === `chapter-${sectionIndex}.wav`)) {
        return new Response(JSON.stringify({ skipped: true, path }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const langHint = `Read the following ${language} text naturally:\n\n`;
    const chunks = chunkText(langHint + text);

    const pcmParts: Uint8Array[] = [];
    for (const c of chunks) {
      const pcm = await synthesizeChunk(apiKeys, c, voice);
      pcmParts.push(pcm);
    }
    const totalLen = pcmParts.reduce((n, p) => n + p.byteLength, 0);
    const merged = new Uint8Array(totalLen);
    let o = 0;
    for (const p of pcmParts) { merged.set(p, o); o += p.byteLength; }

    const header = writeWavHeader(merged.byteLength);
    const wav = new Uint8Array(header.byteLength + merged.byteLength);
    wav.set(header, 0);
    wav.set(merged, header.byteLength);

    const { error } = await supabase.storage.from("book-audio").upload(path, wav, {
      contentType: "audio/wav",
      upsert: true,
      cacheControl: "31536000",
    });
    if (error) throw error;

    return new Response(
      JSON.stringify({
        ok: true,
        path,
        bytes: wav.byteLength,
        durationSec: Math.round(merged.byteLength / 2 / SAMPLE_RATE),
        chunks: chunks.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-audio error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
