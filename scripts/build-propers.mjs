/**
 * Builds the bundled daily propers for the EO edition (offline use).
 *
 * Sources (fetched once at build time, bundled as static data):
 *  - oca.org/saints/troparia/{y}/{m}/{d} — the day's commemorations with their
 *    troparia and kontakia (OCA's liturgical translations, provided for use in
 *    the churches). We keep the FIRST commemoration (OCA lists by prominence)
 *    as "the saint of the day".
 *  - orthocal.info — the tone of the week for each date (shown on Sundays).
 *
 * Days where OCA provides nothing are recorded with `gap: true` so the UI can
 * show a visible flag rather than inventing content (integrity guardrail).
 *
 *   node scripts/build-propers.mjs 2026-06-06 400
 *
 * Re-run yearly alongside build-readings.mjs / build-scripture.mjs.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const START = process.argv[2] || "2026-06-06";
const DAYS = Number(process.argv[3] || 400);
const OUT = new URL("../src/data/propers.json", import.meta.url);
const CACHE = new URL("./.propers-cache.json", import.meta.url);
const PACE_MS = 700;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE)) : {};
const saveCache = () => writeFileSync(CACHE, JSON.stringify(cache));

function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Decode the entities OCA uses and normalize the " / " line separators. */
function cleanText(s) {
  return s
    .replace(/<em>\s*\(Podoben[^)]*\)\s*<\/em>/gi, "") // melody reference
    .replace(/<[^>]+>/g, " ")
    .replace(/&mdash;/g, "—")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;|&#8217;/g, "'")
    .replace(/&hellip;/g, "…")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s*\/\s*/g, "\n") // OCA marks line breaks with " / "
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .trim();
}

/** The first commemoration's troparion and kontakion from the OCA page. */
function parseOca(html) {
  const saintMatch = html.match(/<header><h2>(.*?)<\/h2><\/header>/);
  if (!saintMatch) return null;
  const saint = cleanText(saintMatch[1]);
  // Everything from the first saint heading to the next one (or page end).
  const from = saintMatch.index + saintMatch[0].length;
  const next = html.indexOf("<header><h2>", from);
  const block = html.slice(from, next === -1 ? undefined : next);

  const hymns = [...block.matchAll(
    /<h3>(Troparion|Kontakion)\s*&mdash;\s*Tone\s*(\d+)<\/h3>\s*<p>([\s\S]*?)<\/p>/g,
  )];
  if (!hymns.length) return null;
  const out = { saint };
  for (const [, kind, tone, text] of hymns) {
    const key = kind.toLowerCase();
    if (!out[key]) out[key] = { tone: Number(tone), text: cleanText(text) };
  }
  return out.troparion ? out : null;
}

async function fetchDay(iso, attempt = 1) {
  if (cache[iso]) return cache[iso];
  const [y, m, d] = iso.split("-");
  try {
    const ocaUrl = `https://www.oca.org/saints/troparia/${y}/${m}/${d}`;
    const ocaRes = await fetch(ocaUrl, { headers: { "User-Agent": "prayer-app-builder" } });
    const oca = ocaRes.ok ? parseOca(await ocaRes.text()) : null;
    await sleep(PACE_MS);

    const orthoRes = await fetch(
      `https://orthocal.info/api/gregorian/${y}/${Number(m)}/${Number(d)}/`,
      { headers: { Accept: "application/json" } },
    );
    const tone = orthoRes.ok ? (await orthoRes.json()).tone : null;
    await sleep(PACE_MS);

    const day = oca
      ? { tone, saint: oca.saint, troparion: oca.troparion, kontakion: oca.kontakion }
      : { tone, gap: true };
    cache[iso] = day;
    return day;
  } catch (err) {
    if (attempt < 5) {
      await sleep(2000 * attempt);
      return fetchDay(iso, attempt + 1);
    }
    console.error(`  ! ${iso} failed: ${err.message}`);
    return { gap: true };
  }
}

async function run() {
  const dates = Array.from({ length: DAYS }, (_, i) => addDays(START, i));
  const days = {};
  let done = 0;
  for (const iso of dates) {
    days[iso] = await fetchDay(iso);
    if (++done % 20 === 0 || done === dates.length) {
      console.log(`  ${done}/${dates.length}`);
      saveCache();
    }
  }
  saveCache();

  const gaps = Object.entries(days).filter(([, d]) => d.gap).map(([k]) => k);
  const payload = {
    source: "oca.org daily troparia (OCA translations, for church use); tone from orthocal.info",
    start: START,
    end: addDays(START, DAYS - 1),
    days,
  };
  await mkdir(new URL("../src/data/", import.meta.url), { recursive: true });
  await writeFile(OUT, JSON.stringify(payload));
  console.log(`Wrote ${Object.keys(days).length} days (${gaps.length} gaps).`);
  if (gaps.length) console.log("Gap dates:", gaps.slice(0, 20).join(", "));
}

run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
