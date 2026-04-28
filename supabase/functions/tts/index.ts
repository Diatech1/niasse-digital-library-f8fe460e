// Live TTS edge function — calls Google Gemini TTS directly.
// Returns a single WAV blob for the given text + voice.
// Rotates across GEMINI_API_KEY_2 / GEMINI_API_KEY_3 (and falls back to key 1) on 429.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_CHUNK_CHARS = 3500;
const TTS_MODEL = "gemini-2.5-flash-preview-tts";
const SAMPLE_RATE = 24000;

function jsonResponse(body: unknown, status = 200, extraHeaders: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });
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
  if (keys.length === 0) throw jsonResponse({ error: "No GEMINI_API_KEY* configured" }, 500);

  let lastStatus = 0, lastErr = "";
  for (let i = 0; i < keys.length; i++) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${keys[i]}`;
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
      if (!b64) throw jsonResponse({ error: "Gemini returned no audio data" }, 502);
      const bin = atob(b64);
      const pcm = new Uint8Array(bin.length);
      for (let k = 0; k < bin.length; k++) pcm[k] = bin.charCodeAt(k);
      return pcm;
    }

    lastStatus = resp.status;
    lastErr = (await resp.text()).slice(0, 300);
    if (resp.status === 429 || resp.status === 403) continue;
    throw jsonResponse({ error: `Gemini TTS error (${resp.status})`, details: lastErr }, 502);
  }

  if (lastStatus === 429) {
    throw jsonResponse(
      { pending: true, error: "Audio is still being prepared. Try again in about a minute." },
      202,
      { "Retry-After": "60", "X-TTS-Status": "rate_limited" },
    );
  }
  throw jsonResponse({ error: "All Gemini keys failed", details: lastErr }, 502);
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
    const { text, voice, language } = await req.json().catch(() => ({}));
    if (!text || typeof text !== "string") {
      return jsonResponse({ error: "Missing or invalid 'text' field" }, 400);
    }
    const voiceName = (typeof voice === "string" && voice.trim()) || "Kore";
    const langHint = language && typeof language === "string"
      ? `Read the following ${language} text naturally:\n\n`
      : "";

    const chunks = chunkText(langHint + text);
    const pcmParts: Uint8Array[] = [];
    for (const c of chunks) {
      try {
        pcmParts.push(await synthesizeChunk(c, voiceName));
      } catch (e) {
        if (e instanceof Response) return e;
        throw e;
      }
    }

    const totalPcm = pcmParts.reduce((n, p) => n + p.byteLength, 0);
    const mergedPcm = new Uint8Array(totalPcm);
    let o = 0;
    for (const p of pcmParts) { mergedPcm.set(p, o); o += p.byteLength; }
    const wav = wrapWav(mergedPcm);

    return new Response(wav, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("tts error:", err);
    return jsonResponse({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
