/**
 * TRACK A — the unanchored 60-step personal discipline (LITURGY_DISCIPLINE
 * Parts 1 & 2). Index 0 = step 1 … index 59 = step 60. Advanced by the user's
 * `psalterStep` (here: engine `psalmIndex` + 1), not by the calendar.
 *
 * NOTE: the spec files supplied only step 1 and step 31; the rest were
 * placeholders ("[Remaining Steps … follow this precise array structure]").
 * Fill the nulls below as data arrives. Where a step is null, the app falls
 * back to the bundled BCP Psalter portion for that step.
 *
 * Divine name normalized to "the LORD" to match the rest of the app.
 */

export type PsalmText = { n: number; text: string };

export type DisciplineStep = {
  /** Array 4 — Psalms, Morning Volume. */
  morningPsalms: PsalmText[];
  /** Array 4 — Psalms, Evening Volume. */
  eveningPsalms: PsalmText[];
  /** Array 5 — Short Focus Reading. */
  focusReading?: { ref: string; text: string };
  /** Array 2 — Concluding Collect. */
  collect?: string;
  /** Filtered out for Protestant users per the schema directive. */
  isMarianOrSaints?: boolean;
};

export const STEP_COUNT = 60;

export const DISCIPLINE_STEPS: (DisciplineStep | null)[] = Array.from(
  { length: STEP_COUNT },
  () => null,
);

// ---- Provided samples ----
DISCIPLINE_STEPS[0] = {
  morningPsalms: [
    {
      n: 1,
      text: "Blessed is the man who doesn't walk in the counsel of the wicked, nor stand in the way of sinners, nor sit in the seat of scoffers; but his delight is in the LORD's law. On his law he meditates day and night...",
    },
    {
      n: 2,
      text: "Why do the nations rage, and the peoples plot a vain thing? The kings of the earth take a stand, and the rulers take counsel together, against the LORD, and against his Anointed...",
    },
  ],
  eveningPsalms: [
    {
      n: 6,
      text: "LORD, don't rebuke me in your anger, neither chasten me in your hot displeasure. Have mercy on me, LORD, for I am faint...",
    },
  ],
  focusReading: {
    ref: "Romans 13:11–12",
    text: "The night is far spent, and the day is at hand...",
  },
  collect:
    "O Lord God Almighty, who has brought us safely to the beginning of this day...",
};

DISCIPLINE_STEPS[30] = {
  morningPsalms: [
    {
      n: 31,
      text: "In you, LORD, I take refuge. Let me never be disappointed. Deliver me in your righteousness...",
    },
  ],
  eveningPsalms: [
    {
      n: 34,
      text: "I will bless the LORD at all times. His praise shall continually be in my mouth...",
    },
  ],
  focusReading: {
    ref: "2 Corinthians 4:6",
    text: "Light will shine out of darkness...",
  },
  collect:
    "Almighty God, whose watchfulness never slumbers, clear our minds as we begin the labors of this day...",
};

/** The discipline step (1–60), or null if not yet supplied. */
export function disciplineStep(step: number): DisciplineStep | null {
  if (step < 1 || step > STEP_COUNT) return null;
  return DISCIPLINE_STEPS[step - 1] ?? null;
}
