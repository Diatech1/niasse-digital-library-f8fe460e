// Generate-and-upload audio for one book chapter.
// - Calls Google Gemini TTS (gemini-2.5-flash-preview-tts) — returns PCM, wrapped to WAV
// - Uploads to the `book-audio` bucket at `{bookId}/chapter-{idx}.wav`
// - Rotates across GEMINI_API_KEY_2 / GEMINI_API_KEY_3 (key 1 has depleted credits) on 429.
//
// Note: admin/maintenance endpoint, intentionally unauthenticated for bulk generation.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_CHUNK_CHARS = 3500;
const TTS_MODEL = "gemini-2.5-flash-preview-tts";
const SAMPLE_RATE = 24000;

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

function getKeys(): string[] {
  // Skip key 1 (depleted prepay). Try 2, then 3.
  return [
    Deno.env.get("GEMINI_API_KEY_2"),
    Deno.env.get("GEMINI_API_KEY_3"),
    Deno.env.get("GEMINI_API_KEY"),
  ].filter(Boolean) as string[];
}

async function synthesizeChunk(text: string, voice: string): Promise<Uint8Array> {
  const keys = getKeys();
  if (keys.length === 0) throw new Error("No GEMINI_API_KEY* configured");

  let lastErr = "";
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${key}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
        },
      }),
    });

    if (resp.ok) {
      const j = await resp.json();
      const b64 = j?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!b64) throw new Error("Gemini returned no audio data");
      const bin = atob(b64);
      const pcm = new Uint8Array(bin.length);
      for (let k = 0; k < bin.length; k++) pcm[k] = bin.charCodeAt(k);
      return pcm;
    }

    const errText = await resp.text();
    lastErr = `key#${i + 1} HTTP ${resp.status}: ${errText.slice(0, 200)}`;
    console.log(`generate-audio: ${lastErr}`);
    if (resp.status === 429 || resp.status === 403) continue; // try next key
    throw new Error(lastErr);
  }
  throw new Error(`All Gemini keys failed. Last: ${lastErr}`);
}

function wrapWav(pcm: Uint8Array, sampleRate = SAMPLE_RATE): Uint8Array {
  const numChannels = 1, bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = pcm.byteLength;
  const buf = new ArrayBuffer(44 + dataSize);
  const v = new DataView(buf);
  const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + dataSize, true); w(8, "WAVE");
  w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, numChannels, true); v.setUint32(24, sampleRate, true);
  v.setUint32(28, byteRate, true); v.setUint16(32, blockAlign, true); v.setUint16(34, bitsPerSample, true);
  w(36, "data"); v.setUint32(40, dataSize, true);
  new Uint8Array(buf, 44).set(pcm);
  return new Uint8Array(buf);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { bookId, sectionIndex, text, voice = "Kore", language = "en", skipIfExists = true } =
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
      const pcm = await synthesizeChunk(c, voice);
      pcmParts.push(pcm);
    }

    const totalPcm = pcmParts.reduce((n, p) => n + p.byteLength, 0);
    const mergedPcm = new Uint8Array(totalPcm);
    let o = 0;
    for (const p of pcmParts) { mergedPcm.set(p, o); o += p.byteLength; }
    const wav = wrapWav(mergedPcm);

    const { error } = await supabase.storage.from("book-audio").upload(path, wav, {
      contentType: "audio/wav",
      upsert: true,
      cacheControl: "31536000",
    });
    if (error) throw error;

    const durationSec = Math.round((totalPcm / 2) / SAMPLE_RATE);
    return new Response(
      JSON.stringify({ ok: true, path, bytes: wav.byteLength, chunks: chunks.length, durationSec }),
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
