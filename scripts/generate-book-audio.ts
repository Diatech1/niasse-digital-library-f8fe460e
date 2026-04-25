/**
 * Generate Gemini TTS narrations for all chapters of selected books,
 * encode them to MP3 (64 kbps mono), and upload to the `book-audio`
 * Supabase storage bucket.
 *
 * Path convention:  book-audio/{bookId}/chapter-{idx}.mp3
 *
 * Usage:
 *   GEMINI_API_KEY=... SUPABASE_SERVICE_ROLE_KEY=... bun run scripts/generate-book-audio.ts
 *
 * Env vars required:
 *   GEMINI_API_KEY              (Google AI Studio key)
 *   SUPABASE_SERVICE_ROLE_KEY   (server-side write to storage)
 *   VITE_SUPABASE_URL           (already in .env)
 *
 * Optional:
 *   BOOKS=ruh-al-adab,wird-tidjane   limit to specific contentModules
 *   FORCE=1                          regenerate even if file exists
 *   VOICE=Zephyr                     override default voice
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import lamejs from "@breezystack/lamejs";

// ---------- Config ----------
const VOICE = process.env.VOICE || "Zephyr";
const SAMPLE_RATE = 24000;
const MP3_BITRATE = 64; // kbps mono
const MAX_CHUNK_CHARS = 3500;
const FORCE = process.env.FORCE === "1";
const BUCKET = "book-audio";

// Skip the 4 huge books for now (ran out of free quota otherwise).
const SKIP_MODULES = new Set([
  "kashif-en",
  "volume-8-teachings",
  "kachiful-albas",
  "ifadatou-ahmediyya",
]);

const FILTER = (process.env.BOOKS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// ---------- Polyfill fetch for /books/*.txt (used by loaders) ----------
const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const PUBLIC_DIR = join(PROJECT_ROOT, "public");

const originalFetch = globalThis.fetch;
globalThis.fetch = (async (input: any, init?: any) => {
  const url = typeof input === "string" ? input : input?.url;
  if (typeof url === "string" && url.startsWith("/")) {
    const filePath = join(PUBLIC_DIR, url);
    if (existsSync(filePath)) {
      const buf = readFileSync(filePath);
      return new Response(buf, { status: 200 });
    }
  }
  return originalFetch(input as any, init);
}) as any;

// ---------- Supabase ----------
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ---------- Gemini API key ----------
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY");
  process.exit(1);
}

// ---------- Book registry (mirrors src/hooks/use-book-content.ts) ----------
interface BookSection { id: string; heading: string; content: string }

const volumeMap: Record<string, string> = {
  "volume-1-conditions": "/books/volume-1-conditions-rules.txt",
  "volume-2-liturgies": "/books/volume-2-liturgies-prayers.txt",
  "volume-3-ethics": "/books/volume-3-ethics-advice.txt",
  "volume-4-letters": "/books/volume-4-letters.txt",
  "volume-5-commentaries": "/books/volume-5-commentaries.txt",
  "volume-7-biography": "/books/volume-7-biography.txt",
  "volume-8-teachings": "/books/volume-8-other-teachings.txt",
};

async function loadSections(contentModule: string): Promise<BookSection[]> {
  const map: Record<string, () => Promise<BookSection[]>> = {
    "ruh-al-adab": async () => {
      const m = await import("../src/data/ruh-al-adab.ts");
      return [{
        id: "ruh-al-adab-all",
        heading: m.ruhAlAdabMeta.title,
        content: m.ruhAlAdabVerses.map((v: any) => `${v.number}. ${v.text}`).join("\n"),
      }];
    },
    "comprendre-faydhah": async () => {
      const m = await import("../src/data/comprendre-faydhah.ts");
      return m.comprendreFaydhahSections.map((s: any) => ({ id: s.id, heading: s.heading, content: s.content }));
    },
    "wird-tidjane": async () => (await import("../src/data/wird-tidjane.ts")).wirdTidjaneSections,
    "stations-islam": async () => (await import("../src/data/stations-islam.ts")).stationsIslamSections,
    "adeb-dhikr": async () => (await import("../src/data/adeb-dhikr.ts")).adebDhikrSections,
    "origine-soubha": async () => (await import("../src/data/origine-soubha.ts")).origineSoubhaSections,
    "salat-fatihi": async () => (await import("../src/data/salat-fatihi.ts")).salatFatihiSections,
    "jawharatul-kamal": async () => (await import("../src/data/jawharatul-kamal.ts")).jawharatulKamalSections,
    "dhikr-groupe": async () => (await import("../src/data/dhikr-groupe.ts")).dhikrGroupeSections,
    "fadail-dhikr": async () => (await import("../src/data/fadail-dhikr.ts")).fadailDhikrSections,
    "priere-shaykh-ibrahim": async () => (await import("../src/data/priere-shaykh-ibrahim.ts")).priereShaykhIbrahimSections,
    "stations-deen-en": async () => (await import("../src/data/stations-deen-en.ts")).stationsDeenEnSections,
    "conditions-regles": async () => (await import("../src/data/conditions-regles.ts")).loadConditionsReglesSections(),
  };

  if (map[contentModule]) {
    const arr = await map[contentModule]();
    return arr.map((s: any) => ({ id: s.id, heading: s.heading, content: s.content }));
  }

  if (volumeMap[contentModule]) {
    const { loadVolumeSections } = await import("../src/data/volume-loader.ts");
    return await loadVolumeSections(volumeMap[contentModule], contentModule);
  }

  throw new Error(`Unknown content module: ${contentModule}`);
}

// ---------- Speech text cleanup ----------
function stripForSpeech(content: string): string {
  return content
    .replace(/\{\{PAGE:\d+\}\}/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

// ---------- Gemini synthesis ----------
function base64ToBytes(b64: string): Uint8Array {
  const buf = Buffer.from(b64, "base64");
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

async function synthesizeChunk(text: string, voice: string, retries = 3): Promise<Int16Array> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
  };
  for (let attempt = 0; attempt < retries; attempt++) {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (resp.status === 429) {
      const wait = (attempt + 1) * 30_000;
      console.warn(`  rate-limited, sleeping ${wait / 1000}s...`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    if (!resp.ok) {
      const t = await resp.text();
      throw new Error(`Gemini error ${resp.status}: ${t.slice(0, 300)}`);
    }
    const data: any = await resp.json();
    const b64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!b64) throw new Error("Empty audio response");
    const bytes = base64ToBytes(b64);
    // Interpret as little-endian 16-bit PCM
    const samples = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
    return samples;
  }
  throw new Error("Exceeded retries");
}

// ---------- PCM -> MP3 ----------
function encodeMp3(pcm: Int16Array): Uint8Array {
  const encoder = new lamejs.Mp3Encoder(1, SAMPLE_RATE, MP3_BITRATE);
  const blockSize = 1152;
  const out: Uint8Array[] = [];
  for (let i = 0; i < pcm.length; i += blockSize) {
    const chunk = pcm.subarray(i, i + blockSize);
    const mp3buf = encoder.encodeBuffer(chunk);
    if (mp3buf.length > 0) out.push(new Uint8Array(mp3buf));
  }
  const tail = encoder.flush();
  if (tail.length > 0) out.push(new Uint8Array(tail));
  const total = out.reduce((n, b) => n + b.length, 0);
  const merged = new Uint8Array(total);
  let off = 0;
  for (const b of out) { merged.set(b, off); off += b.length; }
  return merged;
}

// ---------- Storage helpers ----------
async function fileExists(path: string): Promise<boolean> {
  // Use a HEAD request via the public URL — service role can list, but quicker:
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  try {
    const r = await fetch(data.publicUrl, { method: "HEAD" });
    return r.ok;
  } catch { return false; }
}

async function uploadMp3(path: string, mp3: Uint8Array) {
  const { error } = await supabase.storage.from(BUCKET).upload(path, mp3, {
    contentType: "audio/mpeg",
    upsert: true,
    cacheControl: "31536000",
  });
  if (error) throw error;
}

// ---------- Main ----------
async function main() {
  // Get books from DB
  const { data: books, error } = await supabase
    .from("books")
    .select("id, title, language, content_module")
    .not("content_module", "is", null)
    .order("id");
  if (error) throw error;

  const targets = (books as any[]).filter((b) => {
    if (SKIP_MODULES.has(b.content_module)) return false;
    if (FILTER.length && !FILTER.includes(b.content_module)) return false;
    return true;
  });

  console.log(`\nProcessing ${targets.length} books with voice "${VOICE}"\n`);

  let totalChunks = 0;
  let totalChapters = 0;
  let totalUploaded = 0;
  let totalSkipped = 0;

  for (const book of targets) {
    console.log(`\n📖 ${book.id} — ${book.title} (${book.language})`);
    let sections: BookSection[];
    try {
      sections = await loadSections(book.content_module);
    } catch (e) {
      console.error(`  ❌ load failed: ${(e as Error).message}`);
      continue;
    }
    console.log(`  ${sections.length} chapter(s)`);

    for (let idx = 0; idx < sections.length; idx++) {
      const sec = sections[idx];
      const path = `${book.id}/chapter-${idx}.mp3`;
      totalChapters++;

      if (!FORCE && (await fileExists(path))) {
        console.log(`  [${idx + 1}/${sections.length}] ⏭  already exists`);
        totalSkipped++;
        continue;
      }

      const text = stripForSpeech(sec.content);
      if (!text) { console.log(`  [${idx + 1}/${sections.length}] (empty, skipped)`); continue; }
      const langHint = `Read the following ${book.language} text naturally:\n\n`;
      const chunks = chunkText(langHint + text);

      console.log(`  [${idx + 1}/${sections.length}] "${sec.heading.slice(0, 60)}" — ${chunks.length} chunk(s), ${text.length} chars`);

      try {
        const pcmParts: Int16Array[] = [];
        for (let c = 0; c < chunks.length; c++) {
          const pcm = await synthesizeChunk(chunks[c], VOICE);
          pcmParts.push(pcm);
          totalChunks++;
          // Pace requests (free tier: 15 req/min => 1 every 4s is safe)
          await new Promise((r) => setTimeout(r, 4500));
        }
        const totalLen = pcmParts.reduce((n, p) => n + p.length, 0);
        const merged = new Int16Array(totalLen);
        let o = 0;
        for (const p of pcmParts) { merged.set(p, o); o += p.length; }
        const mp3 = encodeMp3(merged);
        await uploadMp3(path, mp3);
        totalUploaded++;
        const seconds = (merged.length / SAMPLE_RATE).toFixed(0);
        const kb = (mp3.length / 1024).toFixed(0);
        console.log(`     ✓ uploaded ${kb} KB, ~${seconds}s of audio`);
      } catch (e) {
        console.error(`     ❌ ${(e as Error).message}`);
      }
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Books: ${targets.length}`);
  console.log(`Chapters: ${totalChapters}`);
  console.log(`Uploaded: ${totalUploaded}`);
  console.log(`Skipped (existed): ${totalSkipped}`);
  console.log(`Gemini calls: ${totalChunks}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
