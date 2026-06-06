/**
 * The Rule of Prayer — a configurable ladder of rungs.
 *
 * Each rung is a concrete daily goal: a morning practice and, on later rungs,
 * an evening one, with a target time. The arc climbs from a non-prayer start to
 * a robust morning + evening rule with scripture. Morning is established before
 * evening is added; depth and scripture come only after consistency.
 *
 * This data is intentionally easy to edit. Tuning the rule means editing rungs
 * here; the engine and UI read whatever is defined.
 */

/**
 * Some steps aren't fixed text — they're resolved against the day and the
 * person's prayer list when prayed (see lib/resolve.ts):
 *  - "gospel": the day's appointed Gospel reading
 *  - "gospelEpistle": the day's Epistle, then Gospel
 *  - "intercession": the standard prayers wrapping the user's named intentions
 */
export type DynamicKind = "gospel" | "gospelEpistle" | "psalm" | "doxology";

export type PrayerStep = {
  /** Short label shown in the order of service, e.g. "Opening" or "Psalm". */
  label: string;
  /** The words to pray. Plain text; line breaks are preserved. Empty for dynamic steps. */
  text: string;
  /** Optional scripture citation shown beneath the text. */
  source?: string;
  /** Optional spoken/silent guidance, e.g. "Sit quietly for a moment." */
  note?: string;
  /** When set, the step's content is resolved at prayer time, not authored here. */
  dynamic?: DynamicKind;
};

export type Practice = {
  /** e.g. "Morning Prayer". */
  title: string;
  /** One-line description of the goal at this rung. */
  goal: string;
  /** Target devotional minutes — what we are working the person up to. */
  minutes: number;
  steps: PrayerStep[];
};

export type Rung = {
  id: number;
  /** Short name, e.g. "A Seed in the Morning". */
  name: string;
  /** One sentence describing where this rung sits on the journey. */
  summary: string;
  morning: Practice;
  /** Present only once the person is ready to add an evening practice. */
  evening?: Practice;
};

const LORDS_PRAYER: PrayerStep = {
  label: "The Lord's Prayer",
  text: "Our Father, who art in heaven,\nhallowed be thy name;\nthy kingdom come;\nthy will be done;\non earth as it is in heaven.\nGive us this day our daily bread.\nAnd forgive us our trespasses,\nas we forgive those who trespass against us.\nAnd lead us not into temptation,\nbut deliver us from evil.\nFor thine is the kingdom, the power, and the glory,\nfor ever and ever. Amen.",
  source: "Matthew 6:9–13",
};

// The doxology is resolved per tradition (Orthodox uses the OCA form).
const GLORIA: PrayerStep = { label: "Glory be", text: "", dynamic: "doxology" };

/**
 * THE DEFAULT LADDER.
 * Rung 0 is the starting seed; the last rung is the established rule.
 * Edit freely — add rungs, adjust steps, change minutes.
 */
export const LADDER: Rung[] = [
  {
    id: 0,
    name: "A Seed in the Morning",
    summary: "The smallest beginning — one prayer, faithfully, each morning.",
    morning: {
      title: "Morning Prayer",
      goal: "Pray the Lord's Prayer each morning.",
      minutes: 2,
      steps: [
        {
          label: "Begin",
          text: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
          note: "Take one slow breath before you begin.",
        },
        LORDS_PRAYER,
      ],
    },
  },
  {
    id: 1,
    name: "Morning Steadied",
    summary: "A short morning prayer with a word of scripture and a moment of stillness.",
    morning: {
      title: "Morning Prayer",
      goal: "A brief opening, a psalm verse, the Lord's Prayer, and silence.",
      minutes: 4,
      steps: [
        {
          label: "Opening",
          text: "O Lord, open thou my lips.\nAnd my mouth shall show forth thy praise.",
          source: "Psalm 51:15",
        },
        {
          label: "Psalm",
          text: "This is the day which the Lord hath made;\nwe will rejoice and be glad in it.",
          source: "Psalm 118:24",
        },
        LORDS_PRAYER,
        {
          label: "Silence",
          text: "Rest quietly before God for a moment.",
          note: "Sit in silence, unhurried, for as long as feels natural.",
        },
      ],
    },
  },
  {
    id: 2,
    name: "Morning Established",
    summary: "A full, settled morning prayer — your morning rule is taking root.",
    morning: {
      title: "Morning Prayer",
      goal: "Opening, the day's Gospel, the Lord's Prayer, intercession, and a closing prayer.",
      minutes: 6,
      steps: [
        {
          label: "Opening",
          text: "O Lord, open thou my lips.\nAnd my mouth shall show forth thy praise.\nO God, make speed to save me;\nO Lord, make haste to help me.",
          source: "Psalm 51:15; 70:1",
        },
        GLORIA,
        {
          label: "The Holy Gospel",
          text: "",
          dynamic: "gospel",
        },
        LORDS_PRAYER,
        {
          label: "A Closing Prayer",
          text: "O Lord, our heavenly Father, by whose providence the duties of men are appointed: grant me grace to do this day the work set before me, that I may not weary nor faint, but offer it all to thee. Amen.",
        },
      ],
    },
  },
  {
    id: 3,
    name: "Morning & A Quiet Evening",
    summary: "Your morning rule holds; now a short evening prayer closes the day.",
    morning: {
      title: "Morning Prayer",
      goal: "Your established morning prayer.",
      minutes: 7,
      steps: [
        {
          label: "Opening",
          text: "O Lord, open thou my lips.\nAnd my mouth shall show forth thy praise.",
          source: "Psalm 51:15",
        },
        GLORIA,
        {
          label: "Psalm",
          text: "The Lord is my shepherd; I shall not want.\nHe maketh me to lie down in green pastures;\nhe leadeth me beside the still waters.\nHe restoreth my soul.",
          source: "Psalm 23:1–3",
        },
        LORDS_PRAYER,
        {
          label: "A Closing Prayer",
          text: "Grant me grace, O Lord, to do this day the work set before me, and to offer it all to thee. Amen.",
        },
      ],
    },
    evening: {
      title: "Evening Prayer",
      goal: "A brief examination of the day and a prayer for the night.",
      minutes: 3,
      steps: [
        {
          label: "Looking Back on the Day",
          text: "Look back over the day. Where did you meet grace? Where did you fall short?",
          note: "Give thanks for the good; ask forgiveness for the rest.",
        },
        {
          label: "Psalm",
          text: "I will both lay me down in peace, and sleep:\nfor thou, Lord, only makest me dwell in safety.",
          source: "Psalm 4:8",
        },
        {
          label: "Prayer for the night",
          text: "Lighten my darkness, I beseech thee, O Lord; and by thy great mercy defend me from all perils and dangers of this night. Amen.",
        },
      ],
    },
  },
  {
    id: 4,
    name: "A Deepening Morning",
    summary: "Morning grows toward unhurried devotional time with scripture reading.",
    morning: {
      title: "Morning Prayer",
      goal: "Opening, psalm, a passage of scripture read slowly, prayer, and silence — about ten to fifteen minutes.",
      minutes: 13,
      steps: [
        {
          label: "Opening",
          text: "O Lord, open thou my lips.\nAnd my mouth shall show forth thy praise.\nO God, make speed to save me;\nO Lord, make haste to help me.",
          source: "Psalm 51:15; 70:1",
        },
        GLORIA,
        {
          label: "Psalm",
          text: "Bless the Lord, O my soul:\nand all that is within me, bless his holy name.\nBless the Lord, O my soul,\nand forget not all his benefits.",
          source: "Psalm 103:1–2",
        },
        {
          label: "The Scriptures",
          text: "",
          dynamic: "gospelEpistle",
        },
        {
          label: "Reflection",
          text: "Sit with the word you were given. What is God saying through it?",
          note: "Hold it in silence rather than analysing it.",
        },
        LORDS_PRAYER,
        {
          label: "A Closing Prayer",
          text: "O God, who art the author of peace and lover of concord: defend me in all assaults, that I may surely trust in thy defence, through Jesus Christ our Lord. Amen.",
        },
      ],
    },
    evening: {
      title: "Evening Prayer",
      goal: "Your quiet evening prayer.",
      minutes: 3,
      steps: [
        {
          label: "Looking Back on the Day",
          text: "Look back over the day. Give thanks for grace; ask forgiveness for the rest.",
        },
        {
          label: "Psalm",
          text: "I will both lay me down in peace, and sleep:\nfor thou, Lord, only makest me dwell in safety.",
          source: "Psalm 4:8",
        },
        {
          label: "Prayer for the night",
          text: "Lighten my darkness, I beseech thee, O Lord; and defend me from all perils of this night. Amen.",
        },
      ],
    },
  },
  {
    id: 5,
    name: "Praying the Psalms in Course",
    summary:
      "Both prayers hold, and you begin to pray through the whole Psalter, a portion at a time.",
    morning: {
      title: "Morning Prayer",
      goal: "A Psalm portion, the day's scriptures, prayer and intercession — unhurried, with the Psalter unfolding day by day.",
      minutes: 17,
      steps: [
        {
          label: "Opening",
          text: "O Lord, open thou my lips.\nAnd my mouth shall show forth thy praise.\nO God, make speed to save me;\nO Lord, make haste to help me.",
          source: "Psalm 51:15; 70:1",
        },
        GLORIA,
        { label: "The Psalms", text: "", dynamic: "psalm" },
        { label: "The Scriptures", text: "", dynamic: "gospelEpistle" },
        {
          label: "Reflection",
          text: "Sit with the word you were given. What is God saying through it?",
          note: "Hold it in silence rather than analysing it.",
        },
        LORDS_PRAYER,
        {
          label: "A Closing Prayer",
          text: "O God, who art the author of peace and lover of concord: defend me in all assaults, that I may surely trust in thy defence, through Jesus Christ our Lord. Amen.",
        },
      ],
    },
    evening: {
      title: "Evening Prayer",
      goal: "A look back, a Psalm portion when chosen, and a prayer for the night.",
      minutes: 6,
      steps: [
        {
          label: "Looking Back on the Day",
          text: "Look back over the day. Give thanks for grace; ask forgiveness for the rest.",
        },
        { label: "The Psalms", text: "", dynamic: "psalm" },
        {
          label: "A Psalm",
          text: "I will both lay me down in peace, and sleep:\nfor thou, Lord, only makest me dwell in safety.",
          source: "Psalm 4:8",
        },
        {
          label: "Prayer for the night",
          text: "Lighten my darkness, I beseech thee, O Lord; and by thy great mercy defend me from all perils and dangers of this night. Amen.",
        },
      ],
    },
  },
];

export const FIRST_RUNG = 0;
export const LAST_RUNG = LADDER.length - 1;

export function rungAt(index: number): Rung {
  const clamped = Math.max(0, Math.min(LADDER.length - 1, index));
  return LADDER[clamped];
}
