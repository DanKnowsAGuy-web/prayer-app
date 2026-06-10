/**
 * Verifies the rule-summary used by the EO share feature: window gating by
 * history span, and the generated message's counts and signature.
 *
 *   node --import ./scripts/ts-resolve.mjs scripts/test-summary.mjs
 */
import { availableWindows, buildSummary } from "../src/lib/ruleSummary.ts";

let failures = 0;
const ok = (cond, msg) => {
  if (cond) console.log("  ✓ " + msg);
  else {
    console.log("  ✗ " + msg);
    failures++;
  }
};

const day = (n) => `2026-06-${String(n).padStart(2, "0")}`;
const rec = (n, part, kinds = ["psalm", "gospel", "lords"], secs = 600) => ({
  date: day(n),
  part,
  kinds,
  secs,
});

// Window gating: offered only once the history spans the window.
ok(availableWindows([], day(10)).length === 0, "no history → no windows");
ok(
  availableWindows([rec(8, "morning")], day(10)).length === 0,
  "3 days of use → no windows",
);
ok(
  JSON.stringify(availableWindows([rec(1, "morning")], day(10))) === "[7]",
  "10 days of use → only the week",
);
ok(
  JSON.stringify(availableWindows([rec(1, "morning")], day(14))) === "[7,14]",
  "14 days of use → week and two weeks",
);

// Message shape: counts, content phrase, minutes, signature.
const amens = [
  rec(4, "morning", ["psalm", "gospel", "intercession", "lords"], 900),
  rec(5, "morning", ["psalm", "gospel", "lords"], 900),
  rec(5, "evening", ["psalm", "epistle", "lords"], 600),
  rec(7, "morning", ["psalm", "gospel", "lords"], 900),
];
const msg = buildSummary(amens, 7, day(10), "Daniel");
ok(msg.startsWith("Father, bless. Over the last week"), `greeting + window ("${msg.slice(0, 40)}…")`);
ok(/morning prayer 3 of 7 days/.test(msg), "morning count 3 of 7");
ok(/evening prayer 1 of 7/.test(msg), "evening count 1 of 7");
ok(/the Psalms in course/.test(msg), "content: Psalms");
ok(/the daily Gospel and Epistle/.test(msg), "content: Gospel and Epistle merged");
ok(/about 15 minutes in the morning/.test(msg), "average morning minutes");
ok(/ — Daniel$/.test(msg), "signed with the name");

const unsigned = buildSummary(amens, 7, day(10), "");
ok(!/—\s*$/.test(unsigned) && unsigned.endsWith("."), "no name → no signature");

if (failures) {
  console.log(`\nFAILED with ${failures} problem(s).`);
  process.exitCode = 1;
} else {
  console.log("PASS — the rule summary gates and reads correctly.");
}
