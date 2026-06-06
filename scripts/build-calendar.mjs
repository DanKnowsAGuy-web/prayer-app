/**
 * Resolves scripts/calendar-refs.json (date → morning/evening Gospel refs) into
 * full verbatim World English Bible prose, written to src/data/calendarGospels.json.
 *
 * Efficiency: each needed chapter is fetched once from bible-api.com (WEB) and
 * cached to scripts/.chapter-cache.json; verse ranges are then sliced locally.
 * The WEB divine name "Yahweh" is preserved exactly as the source renders it.
 *
 *   node scripts/build-calendar.mjs
 *
 * Resumable: rerun after a rate-limit and it skips chapters already cached.
 */
import { readFile, writeFile } from "node:fs/promises";

const REFS = new URL("./calendar-refs.json", import.meta.url);
const CACHE = new URL("./.chapter-cache.json", import.meta.url);
const OUT = new URL("../src/data/calendarGospels.json", import.meta.url);
const PACE_MS = 1100;

/** Parse "John 4:31-42" or "Mark 2:23-3:6" → {book, sc, sv, ec, ev}. */
function parseRef(ref) {
  const m = ref.match(/^(\d?\s?[A-Za-z]+)\s+(\d+):(\d+)-(?:(\d+):)?(\d+)$/);
  if (!m) throw new Error(`Unparseable ref: ${ref}`);
  const book = m[1].trim();
  const sc = +m[2], sv = +m[3];
  const ec = m[4] ? +m[4] : sc;
  const ev = +m[5];
  return { book, sc, sv, ec, ev };
}

const chapterKey = (book, ch) => `${book} ${ch}`;

let cache = {};
try {
  cache = JSON.parse(await readFile(CACHE, "utf8"));
} catch {
  /* no cache yet */
}

async function fetchChapter(book, ch, attempt = 1) {
  const key = chapterKey(book, ch);
  if (cache[key]) return cache[key];
  const url = `https://bible-api.com/${encodeURIComponent(book)}+${ch}?translation=web`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();
    const verses = j.verses.map((v) => ({ ch: v.chapter, v: v.verse, t: v.text }));
    cache[key] = verses;
    await writeFile(CACHE, JSON.stringify(cache));
    await new Promise((r) => setTimeout(r, PACE_MS));
    return verses;
  } catch (err) {
    if (attempt < 6) {
      const wait = /429/.test(err.message) ? 5000 * attempt : 800 * attempt;
      await new Promise((r) => setTimeout(r, wait));
      return fetchChapter(book, ch, attempt + 1);
    }
    throw new Error(`${key} failed: ${err.message}`);
  }
}

/** Join the verses of a parsed ref into prose. */
function sliceText(parsed) {
  const { book, sc, sv, ec, ev } = parsed;
  const out = [];
  for (let ch = sc; ch <= ec; ch++) {
    const verses = cache[chapterKey(book, ch)] || [];
    for (const v of verses) {
      const after = ch > sc || v.v >= sv;
      const before = ch < ec || v.v <= ev;
      if (after && before) out.push(v.t.trim());
    }
  }
  return out.join(" ").replace(/\s+/g, " ").trim();
}

async function run() {
  const refs = JSON.parse(await readFile(REFS, "utf8"));

  // 1. Collect every chapter needed.
  const needed = new Set();
  for (const r of refs) {
    for (const ref of [r.morningRef, r.eveningRef]) {
      const p = parseRef(ref);
      for (let ch = p.sc; ch <= p.ec; ch++) needed.add(chapterKey(p.book, ch));
    }
  }
  const list = [...needed];
  console.log(`${refs.length} dates need ${list.length} chapters.`);

  // 2. Fetch each chapter once (cached/resumable).
  let done = 0;
  for (const key of list) {
    const [book, ch] = [key.replace(/ \d+$/, ""), key.match(/(\d+)$/)[1]];
    await fetchChapter(book, +ch);
    done++;
    if (done % 10 === 0 || done === list.length)
      console.log(`  chapters ${done}/${list.length}`);
  }

  // 3. Slice every date into prose.
  const days = {};
  for (const r of refs) {
    days[r.date] = {
      morning: { ref: r.morningRef, text: sliceText(parseRef(r.morningRef)) },
      evening: { ref: r.eveningRef, text: sliceText(parseRef(r.eveningRef)) },
    };
  }

  const payload = {
    translation: "World English Bible",
    note: "Verbatim WEB Gospel text resolved from calendar-refs.json. Divine name 'Yahweh' preserved.",
    days,
  };
  await writeFile(OUT, JSON.stringify(payload));

  const empty = Object.entries(days).filter(
    ([, d]) => !d.morning.text || !d.evening.text,
  );
  console.log(
    `Wrote ${Object.keys(days).length} dates.` +
      (empty.length ? ` EMPTY: ${empty.map((e) => e[0]).join(",")}` : " All non-empty."),
  );
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
