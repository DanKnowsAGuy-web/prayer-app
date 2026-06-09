/**
 * Assembles the office prayed today as a value spine, from a floor upward.
 *
 * Every segment carries an explicit `kind` and a `level`. The slider picks a
 * level; segments with `level <= chosen` are kept, the floor (the Lord's
 * Prayer) never leaves. Framing elements (the doxology, the closing prayer)
 * bind to what they belong to rather than to a blanket rule, so they can never
 * orphan. Placement is driven by `kind`, never by the user-facing label — so
 * renaming a segment can never move it.
 */

import {
  intentionsForDate,
  type Intention,
  type Prefs,
  type Tradition,
} from "./engine";
import type { DayPart } from "./daypart";
import { TRADITION_META, DEFAULT_DOXOLOGY } from "./traditions";

export type MovementKind =
  | "tradition-opening"
  | "opening-line"
  | "doxology"
  | "psalm"
  | "epistle"
  | "gospel"
  | "song"
  | "reading"
  | "reflection"
  | "cycle"
  | "intercession"
  | "examen"
  | "night-psalm"
  | "lords"
  | "closing"
  | "prayer-night";

export type Movement = {
  label: string;
  text: string;
  /** Citation shown beneath the text (e.g. an Epistle reference). */
  source?: string;
  /** Citation shown above the text, so you know what you're about to read. */
  ref?: string;
  note?: string;
  /** What this movement IS — drives placement, bindings, and estimates. */
  kind?: MovementKind;
  /** Position on the value spine (1 = floor). Optional segments use OPT. */
  level?: number;
  /** Show a sign-of-the-cross mark (traditions that cross themselves). */
  cross?: boolean;
};

/** Optional-depth level: above the whole spine, off unless opted in. */
export const OPT = 99;

/**
 * The top of the spine for each part. The morning tops out at the Psalms; the
 * Epistle is an evening-only segment, so the evening reaches one level deeper.
 */
export const MAX_LEVEL: Record<DayPart, number> = { morning: 5, evening: 6 };

// ── Fixed office text (the canonical wording lives here) ─────────────────────

const OPENING_LINE: Movement = {
  kind: "opening-line",
  level: 1,
  label: "Opening line",
  text: "O Lord, open thou my lips.\nAnd my mouth shall show forth thy praise.\nO God, make speed to save me;\nO Lord, make haste to help me.",
  source: "Psalm 51:15; 70:1",
};

const LORDS_PRAYER: Movement = {
  kind: "lords",
  level: 1,
  label: "The Lord's Prayer",
  text: "Our Father, who art in heaven,\nhallowed be thy name;\nthy kingdom come;\nthy will be done;\non earth as it is in heaven.\nGive us this day our daily bread.\nAnd forgive us our trespasses,\nas we forgive those who trespass against us.\nAnd lead us not into temptation,\nbut deliver us from evil.\nFor thine is the kingdom, the power, and the glory,\nfor ever and ever. Amen.",
  source: "Matthew 6:9–13",
};

const DEFAULT_CLOSING: Movement = {
  kind: "closing",
  level: 2,
  label: "Closing prayer",
  text: "O Lord, our heavenly Father, by whose providence the duties of men are appointed: grant me grace to do this day the work set before me, that I may not weary nor faint, but offer it all to thee. Amen.",
};

const EXAMEN: Movement = {
  kind: "examen",
  level: 1,
  label: "the Examen",
  text: "Look back over the day. Where did you meet grace? Where did you fall short?",
  note: "Give thanks for the good; ask forgiveness for the rest.",
};

const NIGHT_PSALM: Movement = {
  kind: "night-psalm",
  level: 1,
  label: "Night Psalm",
  text: "I will both lay me down in peace, and sleep:\nfor thou, Lord, only makest me dwell in safety.",
  source: "Psalm 4:8",
};

const PRAYER_NIGHT: Movement = {
  kind: "prayer-night",
  level: 1,
  label: "Prayer for the night",
  text: "Lighten my darkness, I beseech thee, O Lord; and by thy great mercy defend me from all perils and dangers of this night. Amen.",
};

const REFLECTION: Movement = {
  kind: "reflection",
  level: OPT,
  label: "Reflection",
  text: "Sit with the word you were given. What is God saying through it?",
  note: "Hold it in silence rather than analysing it.",
};

/** The standard prayers said around the names of those being interceded for. */
export const INTERCESSION_BEFORE =
  "Lord, listen to the petition of our prayers, unworthy as we may be, and grant all good things profitable for our souls and salvation. For the servants of God we pray, Lord, have mercy:";
export const INTERCESSION_AFTER =
  "Lord, as You will and as You know, have mercy on us and save us, for You are good and love mankind.\n\nThrough the prayers of the holy fathers and holy mothers and all the saints who have gone before us, have mercy on us and save us.\n\nIn the name of the Father, and the Son, and the Holy Spirit. Amen.";

// ── Reading builders (text comes from the chosen translation store) ──────────

/** The evangelist's name from a citation like "Matthew 5.42-48". */
function evangelist(ref: string): string {
  const m = ref.match(/^[1-3]?\s?[A-Za-z]+/);
  return m ? m[0].trim() : "";
}

/** "Matthew 5.42-48" -> "Matthew 5:42–48", shown before the reading. */
export function formatRef(ref: string): string {
  return ref.replace(/\./g, ":").replace(/-/g, "–");
}

/** The announcement said before the Gospel, in each tradition's voice. */
function gospelAnnounce(name: string, tradition: Tradition | null): string {
  const saint = name ? `Saint ${name}` : "the Evangelist";
  switch (tradition) {
    case "eastern-orthodox":
      return `The reading is from the Holy Gospel according to ${saint}.\n\nGlory to Thee, O Lord, glory to Thee.\n\nLet us attend.`;
    case "roman-catholic":
    case "anglican":
      return `The Holy Gospel according to ${saint}.`;
    case "evangelical":
    case "protestant":
      return name ? `The Gospel according to ${name}.` : "The Gospel.";
    default:
      return `The Holy Gospel according to ${saint}.`;
  }
}

export function buildGospelMovement(
  ref: string,
  text: string,
  tradition: Tradition | null,
): Movement {
  return {
    kind: "gospel",
    level: 2,
    label: "The Gospel",
    ref: formatRef(ref),
    text: `${gospelAnnounce(evangelist(ref), tradition)}\n\n${text}`,
  };
}

export function buildEpistleMovement(ref: string, text: string): Movement {
  return {
    kind: "epistle",
    level: 6,
    label: "The Epistle",
    ref: formatRef(ref),
    text,
  };
}

function intercessionMovement(
  intentions: Intention[],
  date: string,
  close: string,
  attribution?: string,
): Movement {
  const today = intentionsForDate(intentions, date).map((i) => i.text);
  const names = today.length
    ? today.join("\n")
    : "(bring to mind those you carry, and name them before God)";
  return {
    kind: "intercession",
    level: 4,
    label: "Your prayer list",
    text: `${INTERCESSION_BEFORE}\n\n${names}\n\n${close}`,
    ...(attribution ? { source: attribution } : {}),
  };
}

// ── Assembly ─────────────────────────────────────────────────────────────────

export type OfficeCtx = {
  part: DayPart;
  tradition: Tradition | null;
  /** The rotating Psalm portion for this part (kind "psalm"); [] if none. */
  psalmMovements: Movement[];
  /** Resolved Gospel for today, or undefined if none appointed/available. */
  gospel?: Movement;
  /** Resolved Epistle for today, or undefined. */
  epistle?: Movement;
  /** The Gospel song (Benedictus / Magnificat) for this part. */
  song?: Movement;
  /** The day's intercessory-cycle prayer, present only when the cycle is on. */
  cycle?: Movement;
  /** The person's prayer list, prayed in both offices when there are names. */
  intentions: Intention[];
  date: string;
  /** Once-daily carry: whether each reading was already done today. */
  carry: { gospelDone: boolean; epistleDone: boolean };
};

/** Build the full candidate set for the office, in canonical order. */
export function assembleOffice(ctx: OfficeCtx): Movement[] {
  const { part, tradition } = ctx;
  const out: Movement[] = [];
  const push = (m: Movement | undefined | false) => {
    if (m) out.push(m);
  };

  // Tradition opening (carries the Sign of the Cross where applicable).
  if (tradition) {
    const meta = TRADITION_META[tradition];
    push({
      kind: "tradition-opening",
      level: 1,
      label: meta.opening.label,
      text: meta.opening.text,
      ...(meta.openingAttribution ? { source: meta.openingAttribution } : {}),
    });
  }
  push(OPENING_LINE);
  if (part === "evening") push(EXAMEN);

  // Psalms (and the doxology that answers them).
  const hasPsalms = ctx.psalmMovements.length > 0;
  for (const p of ctx.psalmMovements) {
    push({ ...p, kind: "psalm", level: 5 });
  }
  if (hasPsalms) {
    const dox = tradition ? TRADITION_META[tradition].doxology : DEFAULT_DOXOLOGY;
    push({
      kind: "doxology",
      level: 5,
      label: "Doxology (words of praise)",
      text: dox.text,
    });
  }

  // Scripture. The Gospel belongs to the morning (carried to the evening only if
  // not done). The Epistle is evening-only, the deepest evening segment, and
  // once-daily. Epistle before Gospel, by custom.
  const showGospel = ctx.gospel && (part === "morning" || !ctx.carry.gospelDone);
  const showEpistle = part === "evening" && ctx.epistle && !ctx.carry.epistleDone;
  if (showEpistle) push({ ...ctx.epistle!, level: 6 });
  if (showGospel) push(ctx.gospel);

  // Optional depth (off unless opted in): song, reflection.
  push(ctx.song && { ...ctx.song, kind: "song", level: OPT });
  push(REFLECTION);

  // Prayer with the early Church (the intercessory cycle).
  push(ctx.cycle && { ...ctx.cycle, kind: "cycle", level: 3 });

  // Your prayer list — held space, in both offices, when there are names today.
  if (intentionsForDate(ctx.intentions, ctx.date).length) {
    const meta = tradition ? TRADITION_META[tradition] : null;
    const close = meta ? meta.intercessionClose : INTERCESSION_AFTER;
    push(
      intercessionMovement(
        ctx.intentions,
        ctx.date,
        close,
        meta?.intercessionCloseAttribution,
      ),
    );
  }

  // The night's close in the evening; the day's close in the morning.
  if (part === "evening") {
    push(NIGHT_PSALM);
    push(LORDS_PRAYER);
    push(PRAYER_NIGHT);
  } else {
    push(LORDS_PRAYER);
    push(DEFAULT_CLOSING);
  }

  // Mark where crossing traditions make the sign of the cross.
  if (tradition && TRADITION_META[tradition].crosses) {
    for (const m of out) {
      if (
        m.kind === "tradition-opening" ||
        m.kind === "opening-line" ||
        m.kind === "doxology"
      ) {
        m.cross = true;
      }
    }
  }

  return out;
}

// ── Slider ↔ toggles: pure helpers over the candidate set ────────────────────

/** The floor and pure-frame kinds (never count as "a body to close"). */
const FLOOR_KINDS = new Set<MovementKind>([
  "tradition-opening",
  "opening-line",
  "examen",
  "night-psalm",
  "lords",
  "prayer-night",
  "doxology",
  "closing",
]);

/** Initial include state for a chosen spine level (optional depth from prefs). */
export function defaultIncluded(
  movements: Movement[],
  level: number,
  prefs: Prefs,
): boolean[] {
  return movements.map((m) => {
    if (m.level === OPT) {
      if (m.kind === "song") return prefs.song;
      if (m.kind === "reflection") return prefs.reflection;
      return false;
    }
    return (m.level ?? 1) <= level;
  });
}

/**
 * Enforce frame bindings after any change: the doxology rides with the Psalms,
 * the closing prayer appears only when there is a body to close.
 */
export function applyBindings(movements: Movement[], included: boolean[]): boolean[] {
  const psalmKept = movements.some((m, i) => included[i] && m.kind === "psalm");
  const bodyKept = movements.some(
    (m, i) => included[i] && m.kind !== undefined && !FLOOR_KINDS.has(m.kind),
  );
  return movements.map((m, i) => {
    if (m.kind === "doxology") return included[i] && psalmKept;
    if (m.kind === "closing") return included[i] && bodyKept;
    return included[i];
  });
}

/**
 * The spine level the current include set corresponds to, or null if it no
 * longer matches a clean bracket (a "Custom" set the slider can't represent).
 */
export function derivedLevel(movements: Movement[], included: boolean[]): number | null {
  for (let lvl = 1; lvl <= 6; lvl++) {
    const matches = movements.every((m, i) => {
      if (m.level === OPT) return true; // opt-ins don't define the bracket
      if (m.kind === "doxology" || m.kind === "closing") return true; // frame-bound
      return included[i] === ((m.level ?? 1) <= lvl);
    });
    if (matches) {
      const anyOpt = movements.some((m, i) => m.level === OPT && included[i]);
      return anyOpt ? null : lvl;
    }
  }
  return null;
}
