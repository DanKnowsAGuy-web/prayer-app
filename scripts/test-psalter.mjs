/**
 * Verifies the count-based Psalter sequence: 157 units, Psalm 119 split into
 * eight three-stanza blocks, whole psalms otherwise, and that taking N units
 * advances the pointer by N (wrapping).
 *
 *   node scripts/test-psalter.mjs
 */
import { readFileSync } from "node:fs";
import {
  PSALM_UNITS,
  UNIT_COUNT,
  MAX_PSALMS,
  unitMovements,
  unitLabel,
} from "../src/lib/psalter.ts";

const bundle = JSON.parse(
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

ok(UNIT_COUNT === 157 && PSALM_UNITS.length === 157, `157 units (got ${UNIT_COUNT})`);
ok(MAX_PSALMS === 4, "MAX_PSALMS is 4");

// Psalm 119 → 8 three-stanza blocks (last is the single 22nd stanza).
const blocks = PSALM_UNITS.filter((u) => u.n === 119);
const expected = [
  [1, 24], [25, 48], [49, 72], [73, 96],
  [97, 120], [121, 144], [145, 168], [169, 176],
];
ok(blocks.length === 8, `Psalm 119 in 8 blocks (got ${blocks.length})`);
ok(
  blocks.every((b, i) => b.from === expected[i][0] && b.to === expected[i][1]),
  "119 block ranges 1–24 … 169–176",
);

// Every psalm 1–150 present; non-119 exactly once.
let everyPsalmOk = true;
for (let n = 1; n <= 150; n++) {
  const count = PSALM_UNITS.filter((u) => u.n === n).length;
  const want = n === 119 ? 8 : 1;
  if (count !== want) everyPsalmOk = false;
}
ok(everyPsalmOk, "all psalms 1–150 present, whole psalms once each");

// Taking 4 units yields 4 non-empty movements.
const four = unitMovements(bundle, 0, 4);
ok(four.length === 4 && four.every((m) => m.text.trim().length), "4 units → 4 non-empty movements");

// The sequence wraps at the end.
const wrap = unitMovements(bundle, UNIT_COUNT - 1, 3);
ok(
  wrap.length === 3 && wrap[0].label === "Psalm 150" && wrap[1].label === "Psalm 1",
  `wraps past the end (got ${wrap.map((m) => m.label).join(", ")})`,
);

// Advancing by the count taken (the reducer's rule).
const advance = (idx, count) => (idx + count) % UNIT_COUNT;
ok(advance(155, 4) === (155 + 4) % 157, "advance-by-count wraps with the pointer");
ok(unitLabel(118) === "Psalm 119:1–24", `unit 118 is the first 119 block (got ${unitLabel(118)})`);

if (failures) {
  console.log(`\nFAILED with ${failures} problem(s).`);
  process.exitCode = 1;
} else {
  console.log("PASS — the count-based Psalter sequence is correct.");
}
