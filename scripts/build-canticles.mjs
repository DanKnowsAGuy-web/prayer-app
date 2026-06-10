/**
 * Builds the biblical canticles of the Canon (the scriptural odes) for the EO
 * Matins window rotation — World English Bible text, fetched once at build
 * time from bible-api.com (same pipeline as the Psalter) and bundled.
 *
 * The canonical odes toured: 1 (Moses), 3 (Hannah), 4 (Habakkuk), 5 (Isaiah),
 * 6 (Jonah). Ode 2 (Deut 32) is omitted as the prayer books do outside Lent;
 * Odes 7–8 (the Song of the Three Children) are deuterocanonical and absent
 * from WEB/KJV, so they are not bundled; Ode 9 (the Magnificat) lives in the
 * grouped troparia stop instead.
 *
 *   node scripts/build-canticles.mjs
 */
import { writeFileSync } from "node:fs";

const ODES = [
  { ode: 1, name: "The Song of Moses", ref: "Exodus 15:1-18" },
  { ode: 3, name: "The Song of Hannah", ref: "1 Samuel 2:1-10" },
  { ode: 4, name: "The Prayer of Habakkuk", ref: "Habakkuk 3:2-19" },
  { ode: 5, name: "The Song of Isaiah", ref: "Isaiah 26:9-20" },
  { ode: 6, name: "The Prayer of Jonah", ref: "Jonah 2:2-9" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  const out = [];
  for (const o of ODES) {
    const res = await fetch(
      `https://bible-api.com/${encodeURIComponent(o.ref)}?translation=web`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) throw new Error(`${o.ref}: HTTP ${res.status}`);
    const j = await res.json();
    const text = (j.verses || [])
      .map((v) => (v.text || "").replace(/\s+/g, " ").trim())
      .join("\n");
    if (!text) throw new Error(`${o.ref}: empty`);
    out.push({ ...o, text });
    console.log(`  Ode ${o.ode} (${o.ref}): ${text.split(/\s+/).length} words`);
    await sleep(1500);
  }
  writeFileSync(
    new URL("../src/data/canticles.json", import.meta.url),
    JSON.stringify({ translation: "World English Bible", odes: out }),
  );
  console.log(`Wrote canticles.json (${out.length} odes).`);
}

run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
