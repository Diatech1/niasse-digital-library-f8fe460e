// One-shot admin upload endpoint for the audio-generation script.
// Auth: requires X-Admin-Token header equal to the ADMIN_UPLOAD_TOKEN secret.
// Accepts multipart/form-data with fields: path (string), file (binary).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const expected = Deno.env.get("ADMIN_UPLOAD_TOKEN");
  const provided = req.headers.get("x-admin-token");
  if (!expected || provided !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const form = await req.formData();
    const path = form.get("path");
    const file = form.get("file");
    if (typeof path !== "string" || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: "Missing path or file" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await supabase.storage.from("book-audio").upload(path, bytes, {
      contentType: file.type || "audio/mpeg",
      upsert: true,
      cacheControl: "31536000",
    });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, path, bytes: bytes.byteLength }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
