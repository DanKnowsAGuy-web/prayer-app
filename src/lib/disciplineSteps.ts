/**
 * TRACK A — the unanchored 60-step personal discipline (LITURGY_DISCIPLINE).
 * Index 0 = step 1 … index 59 = step 60. Advanced by the user's `psalterStep`
 * (engine `psalmIndex` + 1), not by the calendar.
 *
 * Each step is a small mini-office: morning and evening psalm volumes, a short
 * reading, and a concluding collect for each. Psalm texts are stored verbatim
 * as supplied. Where a step is null, the app falls back to the bundled BCP
 * Psalter portion for that step.
 *
 * Provided so far: steps 1, 2, 3, 31. The rest remain null pending real data.
 */

export type DisciplineStep = {
  /** Array 4 — Psalms, Morning Volume (verbatim text, in order). */
  morningPsalms: string[];
  /** Array 4 — Psalms, Evening Volume. */
  eveningPsalms: string[];
  /** Array 5 — Short Focus Reading. */
  morningShortReading?: string;
  eveningShortReading?: string;
  /** Array 2 — Concluding Collect. */
  morningCollect?: string;
  eveningCollect?: string;
  /** Filtered out for Protestant / Evangelical users per the schema directive. */
  isMarianOrSaints?: boolean;
};

export const STEP_COUNT = 60;

export const DISCIPLINE_STEPS: (DisciplineStep | null)[] = Array.from(
  { length: STEP_COUNT },
  () => null,
);

// ---- STEP 1 ----
DISCIPLINE_STEPS[0] = {
  morningPsalms: [
    "Blessed is the man who doesn't walk in the counsel of the wicked, nor stand in the way of sinners, nor sit in the seat of scoffers; but his delight is in the LORD's law. On his law he meditates day and night...",
    "Why do the nations rage, and the peoples plot a vain thing? The kings of the earth take a stand, and the rulers take counsel together, against the LORD, and against his Anointed...",
  ],
  eveningPsalms: [
    "LORD, don't rebuke me in your anger, neither chasten me in your hot displeasure. Have mercy on me, LORD, for I am faint...",
  ],
  morningShortReading: "The night is far spent, and the day is at hand...",
  morningCollect:
    "O Lord God Almighty, who has brought us safely to the beginning of this day...",
};

// ---- STEP 2 ----
DISCIPLINE_STEPS[1] = {
  morningPsalms: [
    "O Yahweh, defend me from my adversaries. Arise, O Lord, and save me according to your mercy.",
    "Hear my cry, O God; attend unto my prayer. From the end of the earth will I cry unto thee, when my heart is overwhelmed: lead me to the rock that is higher than I.",
  ],
  eveningPsalms: [
    "The heavens declare the glory of God; and the firmament showeth his handywork. Day unto day uttereth speech, and night unto night showeth knowledge.",
  ],
  morningShortReading:
    "For the mind of the flesh is death, but the mind of the Spirit is life and peace.",
  eveningShortReading:
    "Let not the sun go down upon your wrath, neither give place to the devil.",
  morningCollect:
    "Almighty God, who alone canst order the unruly wills and affections of sinful men: Grant unto thy people, that they may love the thing which thou commandest, and desire that which thou dost promise; through Jesus Christ our Lord. Amen.",
  eveningCollect:
    "O God, from whom all holy desires, all good counsels, and all just works do proceed: Give unto thy servants that peace which the world cannot give; through the merits of Jesus Christ our Savior. Amen.",
};

// ---- STEP 3 ----
DISCIPLINE_STEPS[2] = {
  morningPsalms: [
    "The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters.",
    "The earth is the Lord's, and the fullness thereof; the world, and they that dwell therein. For he hath founded it upon the seas, and established it upon the floods.",
  ],
  eveningPsalms: [
    "To thee, O Lord, do I lift up my soul. O my God, I trust in thee: let me not be ashamed, let not mine enemies triumph over me.",
  ],
  morningShortReading:
    "Be renewed in the spirit of your mind, and put on the new man, which after God hath been created in righteousness and holiness of truth.",
  eveningShortReading:
    "He that storeth up treasures for himself is not rich toward God. Seek ye first his kingdom.",
  morningCollect:
    "O Lord, our heavenly Father, almighty and everlasting God, who hast safely brought us to the beginning of this day: Defend us in the same with thy mighty power; and grant that this day we fall into no sin; through Jesus Christ our Lord. Amen.",
  eveningCollect:
    "Be our companion, O Lord, in our paths, and let thy light scatter the darkness of our hearts, that we may walk safely in the light of thy countenance; through Christ our Lord. Amen.",
};

// ---- STEP 31 ----
DISCIPLINE_STEPS[30] = {
  morningPsalms: [
    "In you, LORD, I take refuge. Let me never be disappointed. Deliver me in your righteousness...",
  ],
  eveningPsalms: [
    "I will bless the LORD at all times. His praise shall continually be in my mouth...",
  ],
  morningShortReading: "Light will shine out of darkness...",
  morningCollect:
    "Almighty God, whose watchfulness never slumbers, clear our minds as we begin the labors of this day...",
};

/** The discipline step (1–60), or null if not yet supplied. */
export function disciplineStep(step: number): DisciplineStep | null {
  if (step < 1 || step > STEP_COUNT) return null;
  return DISCIPLINE_STEPS[step - 1] ?? null;
}
