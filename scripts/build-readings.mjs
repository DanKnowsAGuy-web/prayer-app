/**
 * Builds the bundled daily-readings dataset for the app (offline use).
 *
 * Source: orthocal.info — the Orthodox new-calendar (Revised Julian) daily
 * lectionary. We fetch each day's Gospel and Epistle with full passage text
 * (KJV, public domain) and write a single JSON keyed by local "YYYY-MM-DD".
 *
 * The readings are year-specific (the Paschal cycle moves), so re-run this
 * once a year to extend the range:
 *   node scripts/build-readings.mjs 2026-06-06 400
 */
import { writeFile, mkdir } from "node:fs/promises";

const START = process.argv[2] || "2026-06-06";
const DAYS = Number(process.argv[3] || 400);
const CONCURRENCY = 6;
const OUT = new URL("../src/data/readings.json", import.meta.url);

function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Join a passage's verses into readable prose, honoring paragraph breaks. */
function passageText(passage) {
  if (!passage || !passage.length) return "";
  let out = "";
  for (const v of passage) {
    if (v.paragraph_start && out) out += "\n\n";
    else if (out) out += " ";
    out += (v.content || "").trim();
  }
  return out.trim();
}

/** All appointed readings for the day, in order, with full text. */
function allReadings(readings) {
  return (readings || [])
    .map((r) => ({
      source: r.source,
      ref: r.display,
      text: passageText(r.passage),
    }))
    .filter((r) => r.text);
}

async function fetchDay(iso, attempt = 1) {
  const [y, m, d] = iso.split("-").map(Number);
  const url = `https://orthocal.info/api/gregorian/${y}/${m}/${d}/`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();
    return {
      date: iso,
      title: j.summary_title || "",
      readings: allReadings(j.readings),
    };
  } catch (err) {
    if (attempt < 4) {
      await new Promise((r) => setTimeout(r, 400 * attempt));
      return fetchDay(iso, attempt + 1);
    }
    console.error(`  ! ${iso} failed: ${err.message}`);
    return { date: iso, gospel: null, epistle: null };
  }
}

async function run() {
  const dates = Array.from({ length: DAYS }, (_, i) => addDays(START, i));
  const days = {};
  let done = 0;

  // Simple concurrency pool.
  const queue = [...dates];
  async function worker() {
    while (queue.length) {
      const iso = queue.shift();
      const entry = await fetchDay(iso);
      days[iso] = { title: entry.title, readings: entry.readings };
      done++;
      if (done % 25 === 0 || done === dates.length) {
        console.log(`  ${done}/${dates.length}`);
      }
    }
  }
  console.log(`Fetching ${DAYS} days from ${START} …`);
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // Sort keys chronologically for a stable, readable file.
  const sorted = {};
  for (const k of Object.keys(days).sort()) sorted[k] = days[k];

  const payload = {
    translation: "KJV",
    source: "orthocal.info — Orthodox new-calendar (Revised Julian) lectionary",
    start: START,
    end: addDays(START, DAYS - 1),
    days: sorted,
  };

  await mkdir(new URL("../src/data/", import.meta.url), { recursive: true });
  await writeFile(OUT, JSON.stringify(payload));
  const noGospel = Object.values(sorted).filter(
    (d) => !d.readings.some((r) => r.source === "Gospel"),
  ).length;
  const empty = Object.values(sorted).filter((d) => !d.readings.length).length;
  console.log(
    `Wrote ${Object.keys(sorted).length} days (${noGospel} without a Gospel, ${empty} with no readings at all).`,
  );
}

run();
