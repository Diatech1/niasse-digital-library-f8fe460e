// Generate-and-upload audio for one book chapter.
// - Calls Gemini TTS for the provided text
// - Encodes the resulting PCM to MP3 (mono, 64 kbps)
// - Uploads to the `book-audio` bucket at `{bookId}/chapter-{idx}.mp3`
// Note: this is an admin/maintenance endpoint, intentionally unauthenticated for
// one-shot bulk generation by the agent. It's idempotent (skipIfExists default
// true) and only racks up Gemini quota — safe enough for a maintenance tool.
// Disable by setting GEMINI_API_KEY to empty when you're done generating.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
// @ts-ignore - lamejs has no types
import lamejs from "npm:@breezystack/lamejs@1.2.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SAMPLE_RATE = 24000;
const MP3_BITRATE = 64;
const MAX_CHUNK_CHARS = 3500;

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
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

async function synthesizeChunk(apiKey: string, text: string, voice: string): Promise<Int16Array> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
  };
  for (let attempt = 0; attempt < 3; attempt++) {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (resp.status === 429) {
      await new Promise((r) => setTimeout(r, 30_000 * (attempt + 1)));
      continue;
    }
    if (!resp.ok) {
      const t = await resp.text();
      throw new Error(`Gemini ${resp.status}: ${t.slice(0, 300)}`);
    }
    const data: any = await resp.json();
    const b64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!b64) throw new Error("Empty audio response");
    const bytes = base64ToBytes(b64);
    return new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
  }
  throw new Error("Rate-limit retries exhausted");
}

function encodeMp3(pcm: Int16Array): Uint8Array {
  const enc = new lamejs.Mp3Encoder(1, SAMPLE_RATE, MP3_BITRATE);
  const block = 1152;
  const parts: Uint8Array[] = [];
  for (let i = 0; i < pcm.length; i += block) {
    const buf = enc.encodeBuffer(pcm.subarray(i, i + block));
    if (buf.length > 0) parts.push(new Uint8Array(buf));
  }
  const tail = enc.flush();
  if (tail.length > 0) parts.push(new Uint8Array(tail));
  const total = parts.reduce((n, p) => n + p.length, 0);
  const merged = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { merged.set(p, off); off += p.length; }
  return merged;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

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

    const path = `${bookId}/chapter-${sectionIndex}.mp3`;

    if (skipIfExists) {
      const { data: existing } = await supabase.storage.from("book-audio").list(bookId, {
        search: `chapter-${sectionIndex}.mp3`,
      });
      if (existing && existing.some((f) => f.name === `chapter-${sectionIndex}.mp3`)) {
        return new Response(JSON.stringify({ skipped: true, path }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const langHint = `Read the following ${language} text naturally:\n\n`;
    const chunks = chunkText(langHint + text);

    const pcmParts: Int16Array[] = [];
    for (const c of chunks) {
      const pcm = await synthesizeChunk(apiKey, c, voice);
      pcmParts.push(pcm);
    }
    const totalLen = pcmParts.reduce((n, p) => n + p.length, 0);
    const merged = new Int16Array(totalLen);
    let o = 0;
    for (const p of pcmParts) { merged.set(p, o); o += p.length; }

    const mp3 = encodeMp3(merged);

    const { error } = await supabase.storage.from("book-audio").upload(path, mp3, {
      contentType: "audio/mpeg",
      upsert: true,
      cacheControl: "31536000",
    });
    if (error) throw error;

    return new Response(
      JSON.stringify({
        ok: true,
        path,
        bytes: mp3.byteLength,
        durationSec: Math.round(merged.length / SAMPLE_RATE),
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
