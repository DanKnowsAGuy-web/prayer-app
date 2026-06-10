/**
 * Verification: proves every Gospel and Epistle reference the lectionary can
 * request resolves to non-empty verse text in BOTH translations — no gaps.
 *
 *   node scripts/validate-lectionary.mjs
 */
import { readFileSync } from "node:fs";
import { resolveVerses } from "../src/lib/scripture.ts";

const url = (n) => new URL(`../src/data/${n}`, import.meta.url);
const lect = JSON.parse(readFileSync(url("lectionary.json")));
const stores = {
  web: JSON.parse(readFileSync(url("nt-web.json"))),
  kjv: JSON.parse(readFileSync(url("nt-kjv.json"))),
  msb: JSON.parse(readFileSync(url("nt-msb.json"))),
};

let checked = 0;
const gaps = [];
for (const [date, day] of Object.entries(lect.days)) {
  for (const which of ["gospel", "epistle"]) {
    const ref = day[which];
    if (!ref) continue;
    for (const code of ["web", "kjv", "msb"]) {
      checked++;
      const verses = resolveVerses(stores[code], ref);
      if (!verses.length || verses.join("").trim().length === 0) {
        gaps.push(`${date} ${which} [${code}] "${ref}"`);
      }
    }
  }
}

console.log(`Checked ${checked} (reference × translation) resolutions.`);
if (gaps.length) {
  console.log(`\nGAPS (${gaps.length}):`);
  for (const g of gaps.slice(0, 50)) console.log("  " + g);
  if (gaps.length > 50) console.log(`  … and ${gaps.length - 50} more`);
  process.exitCode = 1;
} else {
  console.log("PASS — every Gospel and Epistle reference resolves in WEB, KJV, and MSB.");
}
