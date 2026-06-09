/**
 * Locks the intercessory-cycle serving math (instruction file §4/§5).
 * Run: node scripts/test-cycle.mjs   (Node strips the imported TypeScript types)
 *
 * Note on the requested examples: the spec's recurrence distances are 42 days
 * for Seekers (pool 6) and 84 for Penitence (pool 12). The request's "day 43 /
 * day 85" were illustrative of those distances; this test asserts the true
 * recurrence from each theme's actual occurrence days.
 */
import { serveCycleDay, THEMES } from "../src/lib/intercessoryCycle.ts";

let failures = 0;
const ok = (cond, msg) => {
  if (cond) console.log("  ok  ", msg);
  else {
    console.error("  FAIL", msg);
    failures++;
  }
};
const tradition = (id) => id.slice(id.indexOf("-") + 1);

console.log("First seven completions:");
const expected = [
  "CHURCH-WESTSYRIAC",
  "CIVIL-ALEXANDRIAN",
  "SEEKERS-ROMAN",
  "POOR-CARTHAGINIAN",
  "SICK-BYZANTINE",
  "PENITENCE-ARMENIAN",
  "SAINTS-RAVENNA",
];
const firstSeven = [];
for (let d = 1; d <= 7; d++) firstSeven.push(serveCycleDay(d).entry.id);
ok(
  JSON.stringify(firstSeven) === JSON.stringify(expected),
  "ids match the worked example (§7): " + firstSeven.join(", "),
);
const trads = firstSeven.map(tradition);
ok(
  new Set(trads).size === 7,
  "seven DISTINCT traditions: " + trads.join(", "),
);

console.log("\nRecurrence distances:");
// Seekers: pool 6 → 42. A Seekers day is D where (D-1)%7===2, e.g. D=3.
ok(
  serveCycleDay(3).entry.id === serveCycleDay(3 + 42).entry.id,
  "Seekers entry recurs at +42 (day 3 == day 45)",
);
for (const d of [10, 17, 24, 31, 38]) {
  ok(
    serveCycleDay(3).entry.id !== serveCycleDay(d).entry.id,
    `Seekers day 3 differs from day ${d} (no earlier repeat)`,
  );
}
// Penitence: pool 12 → 84. A Penitence day is D where (D-1)%7===5, e.g. D=6.
ok(
  serveCycleDay(6).entry.id === serveCycleDay(6 + 84).entry.id,
  "Penitence entry recurs at +84 (day 6 == day 90)",
);
for (let k = 1; k < 12; k++) {
  ok(
    serveCycleDay(6).entry.id !== serveCycleDay(6 + 7 * k).entry.id,
    `Penitence day 6 differs from day ${6 + 7 * k} (no earlier repeat)`,
  );
}

console.log("\nEvery theme recurs at 7 × poolSize:");
const firstDay = [1, 2, 3, 4, 5, 6, 7];
THEMES.forEach((theme, idx) => {
  const period = 7 * theme.pool.length;
  const D = firstDay[idx];
  ok(
    serveCycleDay(D).entry.id === serveCycleDay(D + period).entry.id,
    `${theme.name} (pool ${theme.pool.length}) recurs at +${period}`,
  );
});

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exitCode = failures ? 1 : 0;
