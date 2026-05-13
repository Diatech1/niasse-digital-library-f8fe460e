// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
// Pulls dynamic /book/:id and /listen/:id routes from Supabase.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://faydabook.com";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ?? "https://vkjujymsntwacjelyqgv.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranVqeW1zbnR3YWNqZWx5cWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDQ2MDUsImV4cCI6MjA4NzY4MDYwNX0.zQAIfjkl30E3lfOB_gK8vJcuNxvBty4I57wtDFrrZHc";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/library", changefreq: "weekly", priority: "0.9" },
  { path: "/audio", changefreq: "weekly", priority: "0.8" },
  { path: "/settings", changefreq: "yearly", priority: "0.3" },
];

async function fetchBookEntries(): Promise<SitemapEntry[]> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data, error } = await supabase
      .from("books")
      .select("id, has_audio");
    if (error) throw error;
    const entries: SitemapEntry[] = [];
    for (const row of data ?? []) {
      entries.push({
        path: `/book/${row.id}`,
        changefreq: "monthly",
        priority: "0.7",
      });
      entries.push({
        path: `/read/${row.id}`,
        changefreq: "monthly",
        priority: "0.6",
      });
      if (row.has_audio) {
        entries.push({
          path: `/listen/${row.id}`,
          changefreq: "monthly",
          priority: "0.5",
        });
      }
    }
    return entries;
  } catch (err) {
    console.warn("[sitemap] could not fetch books, skipping dynamic entries:", err);
    return [];
  }
}

function buildSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n")
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

async function main() {
  const dynamic = await fetchBookEntries();
  const all = [...staticEntries, ...dynamic];
  writeFileSync(resolve("public/sitemap.xml"), buildSitemap(all));
  console.log(`sitemap.xml written (${all.length} entries)`);
}

main();
