/**
 * Builds the bundled daily propers for the EO edition (offline use).
 *
 * Sources (fetched once at build time, bundled as static data):
 *  - oca.org/saints/troparia/{y}/{m}/{d} — the day's commemorations with their
 *    troparia and kontakia (OCA's liturgical translations, provided for use in
 *    the churches). We keep the FIRST commemoration (OCA lists by prominence)
 *    as "the saint of the day".
 *  - orthocal.info — the tone, fast level, feasts, days-from-Pascha, and the
 *    lives of the day's saints.
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

/** Strip any markup orthocal stories may carry. */
function plain(s) {
  return String(s || "")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&mdash;/g, "—")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;|&#8217;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .trim();
}

async function fetchDay(iso, attempt = 1) {
  const [y, m, d] = iso.split("-");
  try {
    // OCA hymns: reuse the prior run's cache (old combined entries or oca:).
    let oca = cache["oca:" + iso];
    if (oca === undefined) {
      const old = cache[iso];
      if (old && (old.troparion || old.gap)) {
        oca = old.troparion
          ? { saint: old.saint, troparion: old.troparion, kontakion: old.kontakion }
          : null;
      } else {
        const ocaUrl = `https://www.oca.org/saints/troparia/${y}/${m}/${d}`;
        const ocaRes = await fetch(ocaUrl, { headers: { "User-Agent": "prayer-app-builder" } });
        oca = ocaRes.ok ? parseOca(await ocaRes.text()) : null;
        await sleep(PACE_MS);
      }
      cache["oca:" + iso] = oca;
    }

    // orthocal: tone, fast, feasts, Pascha distance, saints' lives.
    let o = cache["ortho:" + iso];
    if (o === undefined) {
      const orthoRes = await fetch(
        `https://orthocal.info/api/gregorian/${y}/${Number(m)}/${Number(d)}/`,
        { headers: { Accept: "application/json" } },
      );
      if (!orthoRes.ok) throw new Error(`orthocal HTTP ${orthoRes.status}`);
      const j = await orthoRes.json();
      o = {
        tone: j.tone ?? null,
        pd: j.pascha_distance ?? null,
        fastLevel: j.fast_level ?? 0,
        fastDesc: j.fast_level_desc || "",
        fastException: j.fast_exception_desc || "",
        feastLevel: j.feast_level ?? 0,
        feasts: j.feasts || [],
        stories: (j.stories || []).map((st) => ({
          t: plain(st.title),
          s: plain(st.story),
        })),
      };
      cache["ortho:" + iso] = o;
      await sleep(PACE_MS);
    }

    const day = {
      tone: o.tone,
      pd: o.pd,
      fast: { level: o.fastLevel, desc: o.fastDesc, exception: o.fastException },
      feast: { level: o.feastLevel, names: o.feasts },
      ...(oca
        ? { saint: oca.saint, troparion: oca.troparion, kontakion: oca.kontakion }
        : { gap: true }),
    };
    return { day, stories: o.stories };
  } catch (err) {
    if (attempt < 5) {
      await sleep(2000 * attempt);
      return fetchDay(iso, attempt + 1);
    }
    console.error(`  ! ${iso} failed: ${err.message}`);
    return { day: { gap: true }, stories: [] };
  }
}

async function run() {
  const dates = Array.from({ length: DAYS }, (_, i) => addDays(START, i));
  const days = {};
  const lives = {};
  let done = 0;
  for (const iso of dates) {
    const r = await fetchDay(iso);
    days[iso] = r.day;
    if (r.stories && r.stories.length) lives[iso] = r.stories;
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
  await writeFile(
    new URL("../src/data/saintLives.json", import.meta.url),
    JSON.stringify({ source: "orthocal.info — lives of the saints", days: lives }),
  );
  console.log(`Wrote ${Object.keys(days).length} days (${gaps.length} gaps), lives for ${Object.keys(lives).length} days.`);
  if (gaps.length) console.log("Gap dates:", gaps.slice(0, 20).join(", "));
}

run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
