// Gemini 2.5 Flash TTS edge function
// Returns a single WAV blob for the given text + voice + language.
// Long text is split into chunks (sentence-aware), each chunk is generated,
// then concatenated into one continuous WAV before being returned.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
  // RIFF
  v.setUint8(0, 0x52); v.setUint8(1, 0x49); v.setUint8(2, 0x46); v.setUint8(3, 0x46);
  v.setUint32(4, 36 + pcmByteLength, true);
  // WAVE
  v.setUint8(8, 0x57); v.setUint8(9, 0x41); v.setUint8(10, 0x56); v.setUint8(11, 0x45);
  // fmt 
  v.setUint8(12, 0x66); v.setUint8(13, 0x6d); v.setUint8(14, 0x74); v.setUint8(15, 0x20);
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, NUM_CHANNELS, true);
  v.setUint32(24, SAMPLE_RATE, true);
  v.setUint32(28, byteRate, true);
  v.setUint16(32, blockAlign, true);
  v.setUint16(34, BITS_PER_SAMPLE, true);
  // data
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
        // hard split overly long sentence on whitespace
        const words = s.split(" ");
        let buf = "";
        for (const w of words) {
          if ((buf + " " + w).trim().length > maxLen) {
            chunks.push(buf.trim());
            buf = w;
          } else {
            buf = buf ? `${buf} ${w}` : w;
          }
        }
        if (buf) chunks.push(buf.trim());
        current = "";
      } else {
        current = s;
      }
    } else {
      current = current ? `${current} ${s}` : s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

async function synthesizeChunk(
  apiKey: string,
  text: string,
  voiceName: string,
): Promise<Uint8Array> {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  };

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    const status = resp.status;
    if (status === 429) {
      throw new Response(
        JSON.stringify({ error: "Rate limit reached. Please wait a moment and try again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (status === 402 || status === 403) {
      throw new Response(
        JSON.stringify({ error: "TTS quota exhausted or unauthorized.", details: errText }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    throw new Response(
      JSON.stringify({ error: `Gemini TTS error (${status})`, details: errText }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const data = await resp.json();
  const b64 =
    data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!b64) {
    throw new Response(
      JSON.stringify({ error: "Empty audio response from Gemini", details: JSON.stringify(data).slice(0, 500) }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  return base64ToBytes(b64);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { text, voice, language } = await req.json().catch(() => ({}));
    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'text' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const voiceName = (typeof voice === "string" && voice.trim()) || "Kore";

    // Light language hint prepended to guide pronunciation. Gemini uses the text
    // itself but a tiny instruction helps for short Arabic/French chapters.
    const langHint = language && typeof language === "string"
      ? `Read the following ${language} text naturally:\n\n`
      : "";

    const chunks = chunkText(langHint + text);

    const pcmParts: Uint8Array[] = [];
    for (const c of chunks) {
      try {
        const pcm = await synthesizeChunk(apiKey, c, voiceName);
        pcmParts.push(pcm);
      } catch (e) {
        if (e instanceof Response) return e;
        throw e;
      }
    }

    const totalLen = pcmParts.reduce((n, p) => n + p.byteLength, 0);
    const merged = new Uint8Array(totalLen);
    let offset = 0;
    for (const p of pcmParts) {
      merged.set(p, offset);
      offset += p.byteLength;
    }

    const header = writeWavHeader(merged.byteLength);
    const wav = new Uint8Array(header.byteLength + merged.byteLength);
    wav.set(header, 0);
    wav.set(merged, header.byteLength);

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
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
