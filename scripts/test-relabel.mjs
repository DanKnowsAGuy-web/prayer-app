/**
 * Proves segment placement is driven by `kind`, never by the user-facing label,
 * so relabeling a segment can never move it.
 *
 *   node scripts/test-relabel.mjs
 *
 * Strategy: the office is assembled purely from `kind`. We assert that every
 * assembled movement has a kind, and that the kinds always appear in the fixed
 * canonical rank order — across traditions, psalm on/off, cycle on/off, and the
 * once-daily carry. A rename can't disturb this because assembly never reads a
 * label. We also check the two frame bindings (doxology ↔ Psalms, closing ↔ a
 * body).
 */
import {
  assembleOffice,
  applyBindings,
  defaultIncluded,
} from "../src/lib/resolve.ts";

// The canonical rank each kind sits at. Assembly must always emit kinds in
// non-decreasing rank, whatever their labels say.
const RANK = {
  "tradition-opening": 1,
  "opening-line": 2,
  examen: 3,
  psalm: 4,
  doxology: 5,
  epistle: 6,
  gospel: 7,
  song: 8,
  reading: 9,
  reflection: 10,
  cycle: 11,
  intercession: 12,
  "night-psalm": 13,
  lords: 14,
  closing: 15,
  "prayer-night": 16,
};

let failures = 0;
const fail = (msg) => {
  console.log("  ✗ " + msg);
  failures++;
};

const gospel = { kind: "gospel", level: 2, label: "The Gospel", text: "g" };
const epistle = { kind: "epistle", level: 6, label: "The Epistle", text: "e" };
const psalms = [
  { label: "Psalm 1", text: "p1" },
  { label: "Psalm 2", text: "p2" },
];
const song = { label: "Benedictus", text: "s" };
const cycle = { label: "Church", text: "c", source: "Hippolytus" };
const intentions = [
  { id: "1", text: "For a friend", added: "2026-06-09", answered: false, cadence: "daily" },
];

const TRADITIONS = [null, "anglican", "eastern-orthodox", "evangelical", "protestant", "roman-catholic"];

function ctx(part, over = {}) {
  return {
    part,
    tradition: "anglican",
    psalmMovements: psalms,
    gospel,
    epistle,
    song,
    cycle,
    intentions,
    date: "2026-06-09",
    carry: { gospelDone: false, epistleDone: false },
    ...over,
  };
}

// 1. Every assembled movement has a kind, and kinds are in canonical order.
let scenarios = 0;
for (const part of ["morning", "evening"]) {
  for (const tradition of TRADITIONS) {
    for (const withPsalms of [true, false]) {
      for (const cycleOn of [true, false]) {
        scenarios++;
        const movements = assembleOffice(
          ctx(part, {
            tradition,
            psalmMovements: withPsalms ? psalms : [],
            cycle: cycleOn ? cycle : undefined,
          }),
        );
        let lastRank = 0;
        for (const m of movements) {
          if (!m.kind) {
            fail(`${part}/${tradition}: a movement "${m.label}" has no kind`);
            continue;
          }
          const rank = RANK[m.kind];
          if (rank === undefined) fail(`unknown kind ${m.kind}`);
          else if (rank < lastRank)
            fail(`${part}/${tradition}: ${m.kind} (rank ${rank}) after rank ${lastRank}`);
          else lastRank = rank;
        }
      }
    }
  }
}
console.log(`Order invariant checked across ${scenarios} scenarios.`);

// 2. The Lord's Prayer (the floor) is always present.
for (const part of ["morning", "evening"]) {
  const ms = assembleOffice(ctx(part));
  if (!ms.some((m) => m.kind === "lords")) fail(`${part}: no Lord's Prayer in the floor`);
}

// 3. Doxology binds to Psalms: present with Psalms, gone without.
{
  const withP = assembleOffice(ctx("morning", { psalmMovements: psalms }));
  if (!withP.some((m) => m.kind === "doxology")) fail("doxology missing when Psalms present");
  const noP = assembleOffice(ctx("morning", { psalmMovements: [] }));
  if (noP.some((m) => m.kind === "doxology")) fail("doxology present without Psalms");
}

// 4. applyBindings drops the doxology if the Psalms are toggled off…
{
  const ms = assembleOffice(ctx("morning"));
  const inc = ms.map(() => true);
  const psalmIdx = ms.findIndex((m) => m.kind === "psalm");
  inc[psalmIdx] = false; // turn the (only assembled) psalm off
  // turn off any other psalms too
  ms.forEach((m, i) => (m.kind === "psalm" ? (inc[i] = false) : null));
  const eff = applyBindings(ms, inc);
  const doxIdx = ms.findIndex((m) => m.kind === "doxology");
  if (eff[doxIdx]) fail("doxology stayed on after Psalms toggled off");
}

// 5. …and drops the closing when nothing but the floor remains.
{
  const ms = assembleOffice(ctx("morning"));
  const floorOnly = defaultIncluded(ms, 1);
  const eff = applyBindings(ms, floorOnly);
  const closingIdx = ms.findIndex((m) => m.kind === "closing");
  if (closingIdx >= 0 && eff[closingIdx]) fail("closing stayed on at the bare floor");
}

// 6. The Epistle is evening-only; the morning never shows it.
{
  const morning = assembleOffice(ctx("morning"));
  if (morning.some((m) => m.kind === "epistle")) fail("Epistle appeared in the morning");
  const evening = assembleOffice(ctx("evening"));
  if (!evening.some((m) => m.kind === "epistle")) fail("evening Epistle missing");
}

// 7. Carry: the evening Gospel/Epistle vanish once already done that day.
{
  const undone = assembleOffice(ctx("evening", { carry: { gospelDone: false, epistleDone: false } }));
  if (!undone.some((m) => m.kind === "gospel")) fail("evening Gospel missing when not yet done");
  const done = assembleOffice(ctx("evening", { carry: { gospelDone: true, epistleDone: true } }));
  if (done.some((m) => m.kind === "gospel" || m.kind === "epistle"))
    fail("evening reading shown though already done");
}

if (failures) {
  console.log(`\nFAILED with ${failures} problem(s).`);
  process.exitCode = 1;
} else {
  console.log("PASS — placement is kind-driven; relabeling cannot move a segment.");
}
