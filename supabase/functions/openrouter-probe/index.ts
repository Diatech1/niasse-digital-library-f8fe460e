// Temporary probe: lists OpenRouter models matching tts/speech and tries a few requests.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) return new Response(JSON.stringify({ error: "no key" }), { status: 500 });

  const out: any = {};

  // 1) List models, filter by audio/tts
  try {
    const r = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const j = await r.json();
    out.models = (j.data || [])
      .filter((m: any) =>
        /tts|speech/i.test(m.id) ||
        (m.architecture?.output_modalities || []).includes("audio")
      )
      .map((m: any) => ({
        id: m.id,
        out: m.architecture?.output_modalities,
        in: m.architecture?.input_modalities,
      }));
  } catch (e) { out.models_err = String(e); }

  // 2) Try several model ids on /audio/speech
  const candidates = [
    "google/gemini-3.1-flash-tts-preview",
    "google/gemini-3-flash-tts-preview",
    "google/gemini-2.5-flash-tts-preview",
    "openai/tts-1",
  ];
  out.attempts = [];
  for (const model of candidates) {
    try {
      const r = await fetch("https://openrouter.ai/api/v1/audio/speech", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, input: "Hello.", voice: "alloy" }),
      });
      const ct = r.headers.get("content-type") || "";
      const body = ct.includes("json") ? await r.text() : `audio (${r.headers.get("content-length")} bytes)`;
      out.attempts.push({ model, status: r.status, ct, body: body.slice(0, 300) });
    } catch (e) {
      out.attempts.push({ model, err: String(e) });
    }
  }

  return new Response(JSON.stringify(out, null, 2), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
