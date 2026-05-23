// Generate-and-upload audio for one book chapter. Final output: MP3 (lamejs).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
// @ts-ignore - lamejs is plain JS
import lamejs from "https://esm.sh/@breezystack/lamejs@1.1.1";

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
  return [
    Deno.env.get("GEMINI_API_KEY_4"),
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
    if (resp.status === 429 || resp.status === 403) continue;
    throw new Error(lastErr);
  }
  throw new Error(`All Gemini keys failed. Last: ${lastErr}`);
}

function wavHeader(dataSize: number, sampleRate = SAMPLE_RATE): Uint8Array {
  const numChannels = 1, bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const buf = new ArrayBuffer(44);
  const v = new DataView(buf);
  const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + dataSize, true); w(8, "WAVE");
  w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, numChannels, true); v.setUint32(24, sampleRate, true);
  v.setUint32(28, byteRate, true); v.setUint16(32, blockAlign, true); v.setUint16(34, bitsPerSample, true);
  w(36, "data"); v.setUint32(40, dataSize, true);
  return new Uint8Array(buf);
}

function wrapWav(pcm: Uint8Array, sampleRate = SAMPLE_RATE): Uint8Array {
  const header = wavHeader(pcm.byteLength, sampleRate);
  const out = new Uint8Array(header.byteLength + pcm.byteLength);
  out.set(header, 0); out.set(pcm, header.byteLength);
  return out;
}

// Encode mono 16-bit PCM (provided as a sequence of byte chunks) to MP3 (64kbps).
async function encodePcmBlobsToMp3(blobs: Blob[], sampleRate = SAMPLE_RATE): Promise<Uint8Array> {
  const encoder = new lamejs.Mp3Encoder(1, sampleRate, 64);
  const FRAME = 1152; // lamejs sample block
  const out: Uint8Array[] = [];
  let leftover = new Uint8Array(0); // unpaired bytes between blobs

  for (const blob of blobs) {
    const buf = new Uint8Array(await blob.arrayBuffer());
    // Concatenate leftover + buf, but only if leftover exists (rare).
    const data = leftover.byteLength
      ? (() => { const m = new Uint8Array(leftover.byteLength + buf.byteLength); m.set(leftover); m.set(buf, leftover.byteLength); return m; })()
      : buf;
    const evenLen = data.byteLength - (data.byteLength % 2);
    leftover = data.subarray(evenLen);
    const samples = new Int16Array(data.buffer, data.byteOffset, evenLen / 2);
    for (let i = 0; i < samples.length; i += FRAME) {
      const block = samples.subarray(i, Math.min(i + FRAME, samples.length));
      const mp3buf = encoder.encodeBuffer(block);
      if (mp3buf.length > 0) out.push(new Uint8Array(mp3buf));
    }
  }
  const tail = encoder.flush();
  if (tail.length > 0) out.push(new Uint8Array(tail));

  let total = 0;
  for (const p of out) total += p.byteLength;
  const merged = new Uint8Array(total);
  let o = 0;
  for (const p of out) { merged.set(p, o); o += p.byteLength; }
  return merged;
}

function makeSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

const partName = (i: number) => `part-${String(i).padStart(3, "0")}.pcm`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { mode, bookId, sectionIndex, voice = "Kore", language = "en" } = body;

    if (!bookId || sectionIndex == null) {
      return new Response(JSON.stringify({ error: "Missing bookId or sectionIndex" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = makeSupabase();
    const finalPath = `${bookId}/${voice}/chapter-${sectionIndex}.mp3`;
    const finalName = `chapter-${sectionIndex}.mp3`;
    const tmpDir = `${bookId}/${voice}/_tmp/chapter-${sectionIndex}`;

    // ---------- PLAN ----------
    if (mode === "plan") {
      const { text, skipIfExists = true } = body;
      if (!text) return new Response(JSON.stringify({ error: "Missing text" }), { status: 400, headers: corsHeaders });
      if (skipIfExists) {
        const { data: existing } = await supabase.storage.from("book-audio").list(`${bookId}/${voice}`, {
          search: finalName,
        });
        if (existing?.some((f) => f.name === finalName)) {
          return new Response(JSON.stringify({ skipped: true, path: finalPath }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
      const langHint = `Read the following ${language} text naturally:\n\n`;
      const chunks = chunkText(langHint + text);
      return new Response(JSON.stringify({ chunks, totalChunks: chunks.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ---------- CHUNK ----------
    if (mode === "chunk") {
      const { chunkIndex, chunkText: ct, skipIfExists = true } = body;
      if (chunkIndex == null || !ct) {
        return new Response(JSON.stringify({ error: "Missing chunkIndex or chunkText" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const partPath = `${tmpDir}/${partName(chunkIndex)}`;
      if (skipIfExists) {
        const { data: existing } = await supabase.storage.from("book-audio").list(tmpDir, {
          search: partName(chunkIndex),
        });
        if (existing?.some((f) => f.name === partName(chunkIndex))) {
          return new Response(JSON.stringify({ skipped: true, partPath }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
      const pcm = await synthesizeChunk(ct, voice);
      const { error } = await supabase.storage.from("book-audio").upload(partPath, pcm, {
        contentType: "application/octet-stream", upsert: true, cacheControl: "3600",
      });
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, partPath, bytes: pcm.byteLength }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ---------- FINALIZE ----------
    if (mode === "finalize") {
      const { totalChunks } = body;
      if (!totalChunks) return new Response(JSON.stringify({ error: "Missing totalChunks" }), { status: 400, headers: corsHeaders });
      const blobs: Blob[] = [];
      let total = 0;
      for (let i = 0; i < totalChunks; i++) {
        const { data, error } = await supabase.storage.from("book-audio").download(`${tmpDir}/${partName(i)}`);
        if (error || !data) throw new Error(`Missing part ${i}: ${error?.message}`);
        blobs.push(data);
        total += data.size;
      }
      const header = wavHeader(total);
      const wavBlob = new Blob([header, ...blobs], { type: "audio/wav" });
      const { error: upErr } = await supabase.storage.from("book-audio").upload(finalPath, wavBlob, {
        contentType: "audio/wav", upsert: true, cacheControl: "31536000",
      });
      if (upErr) throw upErr;
      const paths = Array.from({ length: totalChunks }, (_, i) => `${tmpDir}/${partName(i)}`);
      await supabase.storage.from("book-audio").remove(paths);
      const durationSec = Math.round((total / 2) / SAMPLE_RATE);
      return new Response(JSON.stringify({ ok: true, path: finalPath, bytes: wavBlob.size, durationSec, chunks: totalChunks }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ---------- LEGACY single-shot ----------
    const { text, skipIfExists = true } = body;
    if (!text) {
      return new Response(JSON.stringify({ error: "Missing text" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (skipIfExists) {
      const { data: existing } = await supabase.storage.from("book-audio").list(`${bookId}/${voice}`, {
        search: `chapter-${sectionIndex}.wav`,
      });
      if (existing?.some((f) => f.name === `chapter-${sectionIndex}.wav`)) {
        return new Response(JSON.stringify({ skipped: true, path: finalPath }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }
    const langHint = `Read the following ${language} text naturally:\n\n`;
    const chunks = chunkText(langHint + text);
    const pcmParts: Uint8Array[] = [];
    for (const c of chunks) pcmParts.push(await synthesizeChunk(c, voice));
    const totalPcm = pcmParts.reduce((n, p) => n + p.byteLength, 0);
    const merged = new Uint8Array(totalPcm);
    let o = 0;
    for (const p of pcmParts) { merged.set(p, o); o += p.byteLength; }
    const wav = wrapWav(merged);
    const { error } = await supabase.storage.from("book-audio").upload(finalPath, wav, {
      contentType: "audio/wav", upsert: true, cacheControl: "31536000",
    });
    if (error) throw error;
    const durationSec = Math.round((totalPcm / 2) / SAMPLE_RATE);
    return new Response(JSON.stringify({ ok: true, path: finalPath, bytes: wav.byteLength, chunks: chunks.length, durationSec }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-audio error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
