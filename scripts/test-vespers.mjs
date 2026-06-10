/**
 * Verifies the EO Vespers-shaped evening assembly: the fixed spine survives at
 * every level, the rank interleaves as workshopped, the six-stop psalm loop
 * splits Psalm 104, and the Epistle stands at the summit.
 *
 *   node --import ./scripts/ts-resolve.mjs scripts/test-vespers.mjs
 */
import {
  assembleVespers,
  defaultIncluded,
  VESPERS_MAX_LEVEL,
} from "../src/lib/resolve.ts";
import {
  serveVespersPsalm,
  prokeimenon,
  VESPERS_PSALM_COUNT,
} from "../src/lib/vespers.ts";
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

const psalms = [1, 2].map((n) => ({ label: `Psalm ${n}`, text: `psalm ${n}` }));
const ctx = (over = {}) => ({
  tradition: "eastern-orthodox",
  psalmMovements: psalms,
  traditionPrayer: { label: "An evening prayer of the Church", text: "ep" },
  troparion: { label: "Troparion of the day", text: "trop", source: "OCA" },
  vespersPsalm: serveVespersPsalm(psalter, 0),
  prokeimenon: prokeimenon(3),
  gospel: { kind: "gospel", label: "The Gospel", text: "g" },
  epistle: { kind: "epistle", label: "The Epistle", text: "e" },
  cycle: { label: "Prayer with the early Church", text: "c" },
  intentions: [{ id: "1", text: "For a friend", added: "2026-06-10", answered: false, cadence: "daily" }],
  date: "2026-06-10",
  ...over,
});

const ms = assembleVespers(ctx());

// The fixed spine is present at level 1, including the night's close.
for (const k of ["tradition-opening", "tradition-prayer", "trisagion", "lords", "troparion", "night-psalm", "prayer-night", "dismissal"]) {
  const m = ms.find((x) => x.kind === k);
  ok(m && m.level === 1, `${k} in the floor`);
}

// The rank: Gospel 2, names 3, Vespers psalm 4, phos+prokeimenon pair 5,
// cycle 6, walk [7,10], window 8, Epistle 9.
{
  const lvl = (k) => ms.find((m) => m.kind === k)?.level;
  ok(lvl("gospel") === 2, "Gospel at notch 2 (carry)");
  ok(lvl("intercession") === 3, "names at notch 3");
  ok(lvl("vespers-psalm") === 4, "Vespers psalm at notch 4");
  ok(lvl("phos") === 5 && lvl("prokeimenon") === 5, "O Gladsome Light + prokeimenon paired at 5");
  ok(lvl("cycle") === 6, "early Church at notch 6");
  const walk = ms.filter((m) => m.kind === "psalm").map((m) => m.level);
  ok(JSON.stringify(walk) === "[7,10]", `walk psalm levels (got ${walk})`);
  ok(lvl("vespers-window") === 8, "the close of Vespers at notch 8");
  ok(lvl("epistle") === 9, "the Epistle at the summit (9)");
  ok(VESPERS_MAX_LEVEL === 10, "ten notches");
}

// No Magnificat in the Vespers evening.
ok(!ms.some((m) => m.kind === "song"), "no Magnificat in the evening");

// The floor holds only the spine.
{
  const inc = defaultIncluded(ms, 1);
  const on = ms.filter((_, i) => inc[i]).map((m) => m.kind);
  ok(!on.includes("vespers-psalm") && !on.includes("psalm"), "floor: no psalms");
  ok(!on.includes("epistle") && !on.includes("gospel"), "floor: no readings");
  ok(on.includes("lords") && on.includes("troparion"), "floor: Lord's Prayer + troparion");
}

// The six-stop loop: Psalm 104 in two parts, then the evening psalms; wraps.
{
  ok(VESPERS_PSALM_COUNT === 6, "six stops in the Vespers loop");
  const a = serveVespersPsalm(psalter, 0);
  const b = serveVespersPsalm(psalter, 1);
  ok(/Psalm 104:1–18/.test(a.label) && a.text.length > 300, "stop 1: Psalm 104, first half");
  ok(/Psalm 104:19–35/.test(b.label) && b.text.length > 300, "stop 2: Psalm 104, second half");
  ok(/Psalm 141/.test(serveVespersPsalm(psalter, 2).label), "stop 3: Psalm 141");
  ok(/Lord, I have cried/.test(serveVespersPsalm(psalter, 5).ref), "the evening psalms are labeled");
  ok(/Psalm 104:1–18/.test(serveVespersPsalm(psalter, 6).label), "the loop wraps");
}

// The window holds the full close of Vespers; the prokeimenon follows the weekday.
{
  const win = ms.find((m) => m.kind === "vespers-window");
  ok(/Vouchsafe, O Lord/.test(win.text) && /depart in peace/.test(win.text) && /Virgin Theotokos, rejoice/.test(win.text),
    "window: Vouchsafe + St. Simeon + O Virgin Theotokos");
  ok(/save me by Your name/.test(prokeimenon(3).text), "Wednesday prokeimenon");
  ok(/Behold now, bless the Lord/.test(prokeimenon(0).text), "Sunday prokeimenon");
}

if (failures) {
  console.log(`\nFAILED with ${failures} problem(s).`);
  process.exitCode = 1;
} else {
  console.log("PASS — the Vespers assembly holds its shape at every level.");
}
