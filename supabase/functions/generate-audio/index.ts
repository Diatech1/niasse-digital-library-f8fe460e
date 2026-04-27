// Generate-and-upload audio for one book chapter.
// - Calls OpenRouter TTS (google/gemini-3.1-flash-tts-preview) — returns MP3
// - Uploads to the `book-audio` bucket at `{bookId}/chapter-{idx}.mp3`
//
// Note: this is an admin/maintenance endpoint, intentionally unauthenticated for
// one-shot bulk generation by the agent. Idempotent (skipIfExists default true).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_CHUNK_CHARS = 3500;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/audio/speech";
const TTS_MODEL = "google/gemini-3.1-flash-tts-preview";

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

async function synthesizeChunk(apiKey: string, text: string, voice: string): Promise<Uint8Array> {
  // Up to 3 attempts with exponential backoff on 429/5xx.
  for (let attempt = 0; attempt < 3; attempt++) {
    const resp = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: TTS_MODEL,
        input: text,
        voice,
      }),
    });

    if (resp.ok) {
      const ab = await resp.arrayBuffer();
      return new Uint8Array(ab);
    }

    const errText = await resp.text();
    if (resp.status === 429 || resp.status >= 500) {
      const wait = 5_000 * (attempt + 1);
      console.log(`generate-audio: OpenRouter ${resp.status}, backing off ${wait}ms (attempt ${attempt + 1}/3)`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    throw new Error(`OpenRouter ${resp.status}: ${errText.slice(0, 300)}`);
  }
  throw new Error("OpenRouter TTS retries exhausted");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

    const { bookId, sectionIndex, text, voice = "alloy", language = "en", skipIfExists = true } =
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

    const parts: Uint8Array[] = [];
    for (const c of chunks) {
      const mp3 = await synthesizeChunk(apiKey, c, voice);
      parts.push(mp3);
    }

    // MP3 frames concatenate cleanly — most decoders ignore frame boundaries.
    const totalLen = parts.reduce((n, p) => n + p.byteLength, 0);
    const merged = new Uint8Array(totalLen);
    let o = 0;
    for (const p of parts) { merged.set(p, o); o += p.byteLength; }

    const { error } = await supabase.storage.from("book-audio").upload(path, merged, {
      contentType: "audio/mpeg",
      upsert: true,
      cacheControl: "31536000",
    });
    if (error) throw error;

    return new Response(
      JSON.stringify({
        ok: true,
        path,
        bytes: merged.byteLength,
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
