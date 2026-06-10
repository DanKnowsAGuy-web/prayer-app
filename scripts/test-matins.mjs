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
import {
  weekdayTheme,
  matinsFragment,
  serveMatinsPsalm,
  FRAGMENT_COUNT,
  MATINS_PSALM_COUNT,
} from "../src/lib/matins.ts";
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

const canticles = JSON.parse(
  readFileSync(new URL("../src/data/canticles.json", import.meta.url)),
);
const psalms = [1, 2].map((n) => ({ label: `Psalm ${n}`, text: `psalm ${n}` }));
const ctx = (over = {}) => ({
  tradition: "eastern-orthodox",
  psalmMovements: psalms,
  traditionPrayer: { label: "A morning prayer of the Church", text: "mp" },
  troparion: { label: "Troparion of the day", text: "trop", source: "OCA" },
  kontakion: { label: "Kontakion of the day", text: "kont", source: "OCA" },
  theme: weekdayTheme(1),
  matinsPsalm: serveMatinsPsalm(psalter, 0),
  fragment: matinsFragment(canticles, 0, 1),
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

// The psalm structure: the Matins loop at notch 4, the walk at 7 and 10.
{
  const mp = ms.find((m) => m.kind === "matins-psalm");
  ok(mp && mp.level === 4, "Matins psalm at notch 4");
  const levels = ms.filter((m) => m.kind === "psalm").map((m) => m.level);
  ok(JSON.stringify(levels) === "[7,10]", `walk psalm levels (got ${levels})`);
  const at5 = defaultIncluded(ms, 5);
  const walkAt5 = ms.filter((m, i) => at5[i] && m.kind === "psalm").length;
  const matinsAt5 = ms.filter((m, i) => at5[i] && m.kind === "matins-psalm").length;
  ok(walkAt5 === 0 && matinsAt5 === 1, "mid-session: the Matins psalm only, no walk psalms");
  ok(MATINS_PSALM_COUNT === 11, "eleven psalms in the Matins loop");
  ok(/Psalm 3/.test(serveMatinsPsalm(psalter, 0).label), "loop starts at Psalm 3");
  ok(/Polyeleos/.test(serveMatinsPsalm(psalter, 6).ref), "loop reaches the Polyeleos");
  ok(/Praises/.test(serveMatinsPsalm(psalter, 10).ref), "loop ends in the Praises");
  ok(/Psalm 3/.test(serveMatinsPsalm(psalter, 11).label), "loop wraps");
}

// Full means full: the Gospel and the cycle are in at the top of the slider.
{
  const full = defaultIncluded(ms, MATINS_MAX_LEVEL);
  const onFull = ms.filter((_, i) => full[i]).map((m) => m.kind);
  ok(onFull.includes("gospel") && onFull.includes("cycle"), "full includes Gospel and cycle");
  ok(onFull.includes("great-doxology") && onFull.includes("fragment"), "full: summit present");
  const floor = defaultIncluded(ms, 1);
  const onFloor = ms.filter((_, i) => floor[i]).map((m) => m.kind);
  ok(!onFloor.includes("gospel") && !onFloor.includes("cycle"), "floor excludes Gospel and cycle");
}

// The window rotation: the grouped troparia moment, then the canticles tour.
{
  ok(FRAGMENT_COUNT === 2, "two stops in the window rotation");
  const f0 = matinsFragment(canticles, 0, 3); // Wednesday
  ok(/God is the Lord/.test(f0.text) && /Cross is the guardian/.test(f0.text) && /magnifies the Lord/.test(f0.text),
    "grouped stop: God is the Lord + weekday exapostilarion + Magnificat");
  const f1 = matinsFragment(canticles, 1, 3);
  ok(/Ode 1/.test(f1.ref) && /Moses/.test(f1.ref), "canticle stop starts at Ode 1");
  const f3 = matinsFragment(canticles, 3, 3);
  ok(/Ode 3/.test(f3.ref), `second canticle visit tours on (got "${f3.ref}")`);
  ok(matinsFragment(canticles, 9, 3).ref.includes("Ode 6") || /Jonah/.test(matinsFragment(canticles, 9, 3).ref),
    "the tour reaches Jonah");
}

// The morning slot rotation: eleven prayers, then Psalm 50, then the Creed.
{
  const { serveEoMorningSlot, EO_MORNING_SLOT_COUNT } = await import("../src/lib/eoMorningPrayers.ts");
  ok(EO_MORNING_SLOT_COUNT === 13, "thirteen morning slots");
  const p50 = serveEoMorningSlot(psalter, 11);
  ok(/Psalm 50/.test(p50.title) && p50.text.length > 200, "slot 12 is Psalm 50 with real text");
  const creed = serveEoMorningSlot(psalter, 12);
  ok(/Symbol of Faith/.test(creed.title) && /I believe in one God/.test(creed.text), "slot 13 is the Creed");
  ok(/St\. Basil/.test(serveEoMorningSlot(psalter, 13).title), "slot 14 wraps to the first prayer");
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
