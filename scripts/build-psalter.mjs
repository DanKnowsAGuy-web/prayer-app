/**
 * Builds the bundled Psalter (World English Bible, public domain) for offline use.
 *
 * Verse-level so the BCP portion scheme can split Psalm 119 by verse.
 * The divine name is normalized to the familiar liturgical reading:
 *   "Lord Yahweh" -> "Lord GOD", "Yahweh"/"Yah" -> "the LORD".
 * This is reversible — delete the normalize() call to keep the WEB text as-is.
 *
 *   node scripts/build-psalter.mjs
 */
import { writeFile, mkdir, readFile } from "node:fs/promises";

const OUT = new URL("../src/data/psalter.json", import.meta.url);
const CONCURRENCY = 1;
const PACE_MS = 1500;

function normalize(text) {
  let t = text
    .replace(/Lord Yahweh/g, "Lord GOD")
    .replace(/Yahweh/g, "the LORD")
    .replace(/\bYah\b/g, "the LORD");
  // Re-capitalize "the LORD" when it opens a sentence or line.
  t = t.replace(/(^|[.!?:"”]\s+|\n)the LORD/g, (_, p) => p + "The LORD");
  return t;
}

async function fetchPsalm(n, attempt = 1) {
  const url = `https://bible-api.com/psalm+${n}?translation=web`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();
    return j.verses.map((v) => ({ v: v.verse, text: normalize(v.text.trim()) }));
  } catch (err) {
    if (attempt < 6) {
      // Back off hard on rate limits.
      const wait = /429/.test(err.message) ? 5000 * attempt : 600 * attempt;
      await new Promise((r) => setTimeout(r, wait));
      return fetchPsalm(n, attempt + 1);
    }
    console.error(`  ! Psalm ${n} failed: ${err.message}`);
    return null;
  }
}

async function run() {
  const numbers = Array.from({ length: 150 }, (_, i) => i + 1);
  const psalms = {};

  // Resume: keep any psalms already fetched in a prior run.
  try {
    const prev = JSON.parse(await readFile(OUT, "utf8"));
    for (let n = 1; n <= 150; n++) {
      if (prev.psalms?.[n]?.length) psalms[n] = prev.psalms[n];
    }
  } catch {
    /* no prior file */
  }

  const queue = numbers.filter((n) => !psalms[n]);
  let done = 150 - queue.length;
  console.log(`Fetching ${queue.length} missing Psalms (WEB) … (${done} already have)`);

  async function worker() {
    while (queue.length) {
      const n = queue.shift();
      const got = await fetchPsalm(n);
      if (got) psalms[n] = got;
      done++;
      if (done % 10 === 0 || done === 150) console.log(`  ${done}/150`);
      await new Promise((r) => setTimeout(r, PACE_MS));
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const sorted = {};
  for (let n = 1; n <= 150; n++) sorted[n] = psalms[n];

  const payload = {
    translation: "World English Bible",
    note: "Public domain. Divine name normalized to 'the LORD'.",
    psalms: sorted,
  };
  await mkdir(new URL("../src/data/", import.meta.url), { recursive: true });
  await writeFile(OUT, JSON.stringify(payload));
  const missing = numbers.filter((n) => !sorted[n]);
  console.log(`Wrote 150 Psalms (${missing.length} missing${missing.length ? ": " + missing.join(",") : ""}).`);
}

run();
