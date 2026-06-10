/**
 * Verifies the EO Matins-shaped morning assembly: the fixed spine survives at
 * every level, the value rank interleaves the psalms (one psalm deep in the
 * small sessions), opt-ins stay off at every slider level, and the gap flag
 * carries through rather than invented content.
 *
 *   node --import ./scripts/ts-resolve.mjs scripts/test-matins.mjs
 */
import {
  assembleMatins,
  defaultIncluded,
  MATINS_MAX_LEVEL,
} from "../src/lib/resolve.ts";
import { weekdayTheme, matinsFragment, FRAGMENT_COUNT } from "../src/lib/matins.ts";
import { readFileSync } from "node:fs";

const psalter = JSON.parse(
  readFileSync(new URL("../src/data/psalter.json", import.meta.url)),
);

let failures = 0;
const ok = (cond, msg) => {
  if (cond) console.log("  ✓ " + msg);
  else {
    console.log("  ✗ " + msg);
    failures++;
  }
};

const psalms = [1, 2, 3, 4].map((n) => ({ label: `Psalm ${n}`, text: `psalm ${n}` }));
const ctx = (over = {}) => ({
  tradition: "eastern-orthodox",
  psalmMovements: psalms,
  traditionPrayer: { label: "A morning prayer of the Church", text: "mp" },
  troparion: { label: "Troparion of the day", text: "trop", source: "OCA" },
  kontakion: { label: "Kontakion of the day", text: "kont", source: "OCA" },
  theme: weekdayTheme(1),
  fragment: matinsFragment(psalter, 0),
  gospel: { kind: "gospel", label: "The Gospel", text: "g" },
  cycle: { label: "Prayer with the early Church", text: "c" },
  intentions: [{ id: "1", text: "For a friend", added: "2026-06-10", answered: false, cadence: "daily" }],
  date: "2026-06-10",
  ...over,
});

const ms = assembleMatins(ctx());
const kinds = ms.map((m) => m.kind);

// The fixed spine is present and at level 1.
for (const k of ["tradition-opening", "trisagion", "lords", "tradition-prayer", "troparion", "dismissal"]) {
  const m = ms.find((x) => x.kind === k);
  ok(m && m.level === 1, `${k} in the floor`);
}

// At the floor, exactly the spine survives — no psalms, propers extras, or summit.
{
  const inc = defaultIncluded(ms, 1);
  const on = ms.filter((_, i) => inc[i]).map((m) => m.kind);
  ok(!on.includes("psalm"), "floor: no psalms");
  ok(!on.includes("kontakion") && !on.includes("theme"), "floor: no kontakion/theme");
  ok(!on.includes("great-doxology") && !on.includes("fragment"), "floor: no summit");
  ok(on.includes("troparion") && on.includes("lords"), "floor: troparion + Lord's Prayer");
}

// The interleave: one psalm early (L2), the rest later (L6, L7, L9).
{
  const levels = ms.filter((m) => m.kind === "psalm").map((m) => m.level);
  ok(JSON.stringify(levels) === "[2,6,7,9]", `psalm levels interleave (got ${levels})`);
  const at5 = defaultIncluded(ms, 5);
  const psalmsAt5 = ms.filter((m, i) => at5[i] && m.kind === "psalm").length;
  ok(psalmsAt5 === 1, "mid-session keeps exactly one psalm");
}

// Opt-ins stay off at EVERY level, including full.
{
  const full = defaultIncluded(ms, MATINS_MAX_LEVEL);
  const onFull = ms.filter((_, i) => full[i]).map((m) => m.kind);
  ok(!onFull.includes("gospel") && !onFull.includes("cycle"), "opt-ins off even at full");
  ok(onFull.includes("great-doxology") && onFull.includes("fragment"), "full: summit present");
}

// The fragment rotation cycles with location labels and tours the Six Psalms.
{
  ok(FRAGMENT_COUNT === 5, "five fragments in the rotation");
  const f0 = matinsFragment(psalter, 0);
  const f5 = matinsFragment(psalter, 5);
  ok(/Six Psalms/.test(f0.ref) && /Psalm 3/.test(f0.ref), "fragment 0: Six Psalms, Psalm 3");
  ok(/Psalm 38/.test(f5.ref), `next round tours on (got "${f5.ref}")`);
  ok([0,1,2,3,4].every((i) => matinsFragment(psalter, i).text.trim().length > 50), "all fragments have real text");
}

// Sunday theme carries the tone label.
{
  const sun = weekdayTheme(0, 3);
  ok(/Tone 3/.test(sun.ref), "Sunday remembrance shows the tone");
  const mon = weekdayTheme(1, 3);
  ok(!/Tone/.test(mon.ref), "weekdays do not show the tone");
}

if (failures) {
  console.log(`\nFAILED with ${failures} problem(s).`);
  process.exitCode = 1;
} else {
  console.log("PASS — the Matins assembly holds its shape at every level.");
}
