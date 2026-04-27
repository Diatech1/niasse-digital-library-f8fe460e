// OpenRouter TTS edge function (google/gemini-3.1-flash-tts-preview)
// Returns a single MP3 blob for the given text + voice.
// Long text is split into chunks (sentence-aware), each chunk is generated,
// then concatenated into one MP3 stream before being returned.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_CHUNK_CHARS = 3500;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/audio/speech";
const TTS_MODEL = "google/gemini-3.1-flash-tts-preview";

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

async function synthesizeChunk(apiKey: string, text: string, voice: string): Promise<Uint8Array> {
  const resp = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: TTS_MODEL, input: text, voice }),
  });

  if (resp.ok) {
    const ab = await resp.arrayBuffer();
    return new Uint8Array(ab);
  }

  const errText = await resp.text();
  if (resp.status === 429) {
    throw jsonResponse(
      { pending: true, error: "Audio is still being prepared. Try again in about a minute." },
      202,
      { "Retry-After": "60", "X-TTS-Status": "rate_limited" },
    );
  }
  if (resp.status === 402 || resp.status === 403) {
    throw jsonResponse({ error: "TTS quota exhausted or unauthorized.", details: errText }, 402);
  }
  throw jsonResponse({ error: `OpenRouter TTS error (${resp.status})`, details: errText }, 502);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) return jsonResponse({ error: "OPENROUTER_API_KEY is not configured" }, 500);

    const { text, voice, language } = await req.json().catch(() => ({}));
    if (!text || typeof text !== "string") {
      return jsonResponse({ error: "Missing or invalid 'text' field" }, 400);
    }

    const voiceName = (typeof voice === "string" && voice.trim()) || "alloy";

    const langHint = language && typeof language === "string"
      ? `Read the following ${language} text naturally:\n\n`
      : "";

    const chunks = chunkText(langHint + text);

    const parts: Uint8Array[] = [];
    for (const c of chunks) {
      try {
        const mp3 = await synthesizeChunk(apiKey, c, voiceName);
        parts.push(mp3);
      } catch (e) {
        if (e instanceof Response) return e;
        throw e;
      }
    }

    const totalLen = parts.reduce((n, p) => n + p.byteLength, 0);
    const merged = new Uint8Array(totalLen);
    let offset = 0;
    for (const p of parts) {
      merged.set(p, offset);
      offset += p.byteLength;
    }

    return new Response(merged, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("tts error:", err);
    return jsonResponse({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
