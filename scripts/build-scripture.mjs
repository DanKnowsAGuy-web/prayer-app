/**
 * Builds the offline scripture bundles the lectionary draws on.
 *
 * The app ships a single matched daily plan (Gospel + Epistle), with the verse
 * TEXT selectable between two public-domain translations:
 *   - World English Bible (WEB) — public domain worldwide (ebible.org engwebp)
 *   - King James Version (KJV) — public domain
 * Both are fetched verse-by-verse from bible-api.com (same approach as
 * build-calendar.mjs) and written as compact verse stores, plus a single
 * lectionary.json of references (no text) so the plan is identical regardless
 * of translation — only the wording changes.
 *
 *   node scripts/build-scripture.mjs
 *
 * Re-run when the lectionary range (readings.json) is regenerated.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";

const DATA = new URL("../src/data/", import.meta.url);
const CACHE = new URL("./.scripture-cache.json", import.meta.url);
const CONCURRENCY = 1;
const PACE_MS = 1200; // bible-api rate-limits hard; pace requests and resume via cache.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The New Testament books the Orthodox Gospel + Epistle (Apostol) plan can
// ever request: the four Gospels, Acts, and every NT epistle. Revelation is
// never read liturgically and never appears. Fetching these in full guarantees
// every reference resolves locally with no gaps.
const NT_BOOKS = {
  Matthew: 28, Mark: 16, Luke: 24, John: 21, Acts: 28,
  Romans: 16, "1 Corinthians": 16, "2 Corinthians": 13, Galatians: 6,
  Ephesians: 6, Philippians: 4, Colossians: 4, "1 Thessalonians": 5,
  "2 Thessalonians": 3, "1 Timothy": 6, "2 Timothy": 4, Titus: 3, Philemon: 1,
  Hebrews: 13, James: 5, "1 Peter": 5, "2 Peter": 3, "1 John": 5,
  "2 John": 1, "3 John": 1, Jude: 1,
};

/** Verse counts for the single-chapter books (same in WEB and KJV). */
const SINGLE_VERSES = { Philemon: 25, "2 John": 13, "3 John": 14, Jude: 25 };

const TRANSLATIONS = ["web", "kjv"];

let cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE)) : {};
function saveCache() {
  return writeFile(CACHE, JSON.stringify(cache));
}

/** Fetch one chapter (all verses) for a translation, cached. */
async function fetchChapter(translation, book, ch, attempt = 1) {
  const key = `${translation}:${book}:${ch}`;
  if (cache[key]) return cache[key];
  // Single-chapter books (Jude, Philemon, 2/3 John): bible-api reads "Jude 1"
  // as verse 1 and 404s a bare book or an over-long range, so request the whole
  // chapter by its exact verse span.
  const single = NT_BOOKS[book] === 1;
  const ref = single
    ? encodeURIComponent(`${book} 1:1-${SINGLE_VERSES[book]}`)
    : `${encodeURIComponent(book)}+${ch}`;
  const url = `https://bible-api.com/${ref}?translation=${translation}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (res.status === 429) throw new Error("HTTP 429");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();
    const verses = {};
    for (const v of j.verses || []) {
      verses[v.verse] = (v.text || "").replace(/\s+/g, " ").trim();
    }
    cache[key] = verses;
    await sleep(PACE_MS);
    return verses;
  } catch (err) {
    if (attempt < 10) {
      // 429s need a real cooldown; back off increasingly (5s, 10s, …).
      await sleep(/429/.test(err.message) ? 5000 * attempt : 800 * attempt);
      return fetchChapter(translation, book, ch, attempt + 1);
    }
    throw new Error(`${key} failed: ${err.message}`);
  }
}

async function buildStore(translation) {
  const jobs = [];
  for (const [book, chapters] of Object.entries(NT_BOOKS)) {
    for (let ch = 1; ch <= chapters; ch++) jobs.push({ book, ch });
  }
  const books = {};
  let done = 0;
  const queue = [...jobs];
  async function worker() {
    while (queue.length) {
      const { book, ch } = queue.shift();
      const verses = await fetchChapter(translation, book, ch);
      (books[book] ||= {})[ch] = verses;
      if (++done % 25 === 0 || done === jobs.length) {
        console.log(`  ${translation}: ${done}/${jobs.length} chapters`);
        await saveCache();
      }
    }
  }
  console.log(`Fetching ${translation.toUpperCase()} (${jobs.length} chapters) …`);
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  await saveCache();
  return books;
}

/** Pull the Gospel + Epistle references out of the existing OCA readings. */
async function buildLectionary() {
  const readings = JSON.parse(await readFile(new URL("readings.json", DATA)));
  const days = {};
  for (const [date, day] of Object.entries(readings.days || {})) {
    const gospel = (day.readings || []).find((r) => r.source === "Gospel");
    const epistle = (day.readings || []).find((r) => r.source === "Epistle");
    if (!gospel && !epistle) continue;
    days[date] = {
      ...(gospel ? { gospel: gospel.ref } : {}),
      ...(epistle ? { epistle: epistle.ref } : {}),
    };
  }
  return {
    source: readings.source,
    start: readings.start,
    end: readings.end,
    days,
  };
}

async function run() {
  await mkdir(DATA, { recursive: true });

  const lectionary = await buildLectionary();
  await writeFile(new URL("lectionary.json", DATA), JSON.stringify(lectionary));
  console.log(`Wrote lectionary.json (${Object.keys(lectionary.days).length} days).`);

  for (const t of TRANSLATIONS) {
    const books = await buildStore(t);
    const payload = {
      translation: t === "web" ? "World English Bible" : "King James Version",
      code: t,
      license: t === "web" ? "Public Domain (ebible.org engwebp)" : "Public Domain (KJV)",
      books,
    };
    await writeFile(new URL(`nt-${t}.json`, DATA), JSON.stringify(payload));
    const chapters = Object.values(books).reduce((n, b) => n + Object.keys(b).length, 0);
    console.log(`Wrote nt-${t}.json (${Object.keys(books).length} books, ${chapters} chapters).`);
  }
  console.log("Done. Run scripts/validate-lectionary.mjs to confirm no gaps.");
}

run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
