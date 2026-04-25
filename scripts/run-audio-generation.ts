/**
 * Driver: load every book's chapters from the project, then POST each chapter
 * to the `generate-audio` edge function which generates+uploads the MP3.
 *
 * Run:
 *   bun run scripts/run-audio-generation.ts
 *
 * Env: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY (already in env)
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const VOICE = process.env.VOICE || "Zephyr";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const FORCE = process.env.FORCE === "1";

const SKIP_MODULES = new Set([
  "kashif-en",
  "volume-8-teachings",
  "kachiful-albas",
  "ifadatou-ahmediyya",
]);

const FILTER = (process.env.BOOKS || "").split(",").map((s) => s.trim()).filter(Boolean);

// ---------- fetch polyfill for /books/*.txt loaders ----------
const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const PUBLIC_DIR = join(PROJECT_ROOT, "public");

const originalFetch = globalThis.fetch;
globalThis.fetch = (async (input: any, init?: any) => {
  const url = typeof input === "string" ? input : input?.url;
  if (typeof url === "string" && url.startsWith("/books/")) {
    const filePath = join(PUBLIC_DIR, url);
    if (existsSync(filePath)) {
      return new Response(readFileSync(filePath), { status: 200 });
    }
  }
  return originalFetch(input as any, init);
}) as any;

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
  const m: Record<string, () => Promise<BookSection[]>> = {
    "ruh-al-adab": async () => {
      const x = await import("../src/data/ruh-al-adab");
      return [{
        id: "ruh-al-adab-all",
        heading: x.ruhAlAdabMeta.title,
        content: x.ruhAlAdabVerses.map((v: any) => `${v.number}. ${v.text}`).join("\n"),
      }];
    },
    "comprendre-faydhah": async () => (await import("../src/data/comprendre-faydhah")).comprendreFaydhahSections,
    "wird-tidjane": async () => (await import("../src/data/wird-tidjane")).wirdTidjaneSections,
    "stations-islam": async () => (await import("../src/data/stations-islam")).stationsIslamSections,
    "adeb-dhikr": async () => (await import("../src/data/adeb-dhikr")).adebDhikrSections,
    "origine-soubha": async () => (await import("../src/data/origine-soubha")).origineSoubhaSections,
    "salat-fatihi": async () => (await import("../src/data/salat-fatihi")).salatFatihiSections,
    "jawharatul-kamal": async () => (await import("../src/data/jawharatul-kamal")).jawharatulKamalSections,
    "dhikr-groupe": async () => (await import("../src/data/dhikr-groupe")).dhikrGroupeSections,
    "fadail-dhikr": async () => (await import("../src/data/fadail-dhikr")).fadailDhikrSections,
    "priere-shaykh-ibrahim": async () => (await import("../src/data/priere-shaykh-ibrahim")).priereShaykhIbrahimSections,
    "stations-deen-en": async () => (await import("../src/data/stations-deen-en")).stationsDeenEnSections,
    "conditions-regles": async () => (await import("../src/data/conditions-regles")).loadConditionsReglesSections(),
  };
  if (m[contentModule]) {
    const arr: any[] = await m[contentModule]();
    return arr.map((s) => ({ id: s.id, heading: s.heading, content: s.content }));
  }
  if (volumeMap[contentModule]) {
    const { loadVolumeSections } = await import("../src/data/volume-loader");
    return await loadVolumeSections(volumeMap[contentModule], contentModule);
  }
  throw new Error(`Unknown module: ${contentModule}`);
}

function stripForSpeech(content: string): string {
  return content
    .replace(/\{\{PAGE:\d+\}\}/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchBooks(): Promise<Array<{ id: string; title: string; language: string; content_module: string }>> {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/books?select=id,title,language,content_module&content_module=not.is.null&order=id`,
    { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } },
  );
  if (!r.ok) throw new Error(`books fetch: ${r.status} ${await r.text()}`);
  return await r.json();
}

async function generateChapter(bookId: string, sectionIndex: number, text: string, language: string) {
  const r = await fetch(`${SUPABASE_URL}/functions/v1/generate-audio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ bookId, sectionIndex, text, voice: VOICE, language, skipIfExists: !FORCE }),
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${txt.slice(0, 300)}`);
  return JSON.parse(txt);
}

async function main() {
  const books = await fetchBooks();
  const targets = books.filter((b) => {
    if (!b.content_module) return false;
    if (SKIP_MODULES.has(b.content_module)) return false;
    if (FILTER.length && !FILTER.includes(b.content_module)) return false;
    return true;
  });

  console.log(`\nVoice: ${VOICE}    Books: ${targets.length}    Force: ${FORCE}\n`);

  let calls = 0, uploads = 0, skips = 0, errors = 0;

  for (const book of targets) {
    let sections: BookSection[];
    try { sections = await loadSections(book.content_module); }
    catch (e) { console.error(`📕 ${book.id}: load failed: ${(e as Error).message}`); errors++; continue; }

    console.log(`\n📖 [${book.id}] ${book.title} (${book.language}) — ${sections.length} chapter(s)`);

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      const text = stripForSpeech(sec.content);
      if (!text || text.length < 10) {
        console.log(`  [${i + 1}/${sections.length}] (empty, skip)`);
        continue;
      }

      const heading = sec.heading.slice(0, 50).replace(/\s+/g, " ");
      process.stdout.write(`  [${i + 1}/${sections.length}] "${heading}" (${text.length}c) ... `);

      try {
        const start = Date.now();
        const res = await generateChapter(book.id, i, text, book.language);
        calls++;
        const ms = Date.now() - start;
        if (res.skipped) {
          console.log(`⏭  exists`);
          skips++;
        } else {
          console.log(`✓ ${res.bytes} bytes, ${res.durationSec}s audio (${res.chunks} chunk, ${ms}ms)`);
          uploads++;
        }
      } catch (e) {
        console.log(`❌ ${(e as Error).message}`);
        errors++;
      }

      // Pace: edge function is sequential per call; Gemini free tier is 15 req/min.
      // Each chunk inside the function is ~5s. With 1 chunk per chapter mostly,
      // wait ~4s between calls to stay under 15/min.
      await new Promise((r) => setTimeout(r, 4500));
    }
  }

  console.log(`\n=== Done ===  calls=${calls}  uploads=${uploads}  skipped=${skips}  errors=${errors}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
