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

import { intentionsForDate, type Intention, type Tradition } from "./engine";
import { intercessionBody } from "./intentions";
import type { DayPart } from "./daypart";
import { TRADITION_META, DEFAULT_DOXOLOGY } from "./traditions";
import { TRISAGION, GREAT_DOXOLOGY, DISMISSAL } from "./matins";
import { GLADSOME_LIGHT, VESPERS_WINDOW } from "./vespers";
import {
  APOSTLES_CREED,
  NICENE_CREED,
  earlyChurchCanticles,
  isProtEvang,
} from "./earlyChurch";

export type MovementKind =
  | "tradition-opening"
  | "tradition-prayer"
  | "opening-line"
  | "trisagion"
  | "matins-psalm"
  | "vespers-psalm"
  | "phos"
  | "prokeimenon"
  | "vespers-window"
  | "troparion"
  | "kontakion"
  | "theme"
  | "fragment"
  | "great-doxology"
  | "dismissal"
  | "doxology"
  | "psalm"
  | "epistle"
  | "gospel"
  | "song"
  | "canticle"
  | "creed"
  | "cycle"
  | "intercession"
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
  /** Position on the value spine (1 = floor). */
  level?: number;
  /**
   * An opt-in that EXTENDS the session beyond the slider's budget: off at
   * every slider level, switched on only by its own toggle in the build-out.
   */
  optional?: boolean;
  /** Show a sign-of-the-cross mark (traditions that cross themselves). */
  cross?: boolean;
};

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
  const body = intercessionBody(intentions, date);
  const names = body || "(bring to mind those you carry, and name them before God)";
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
  /** A rotating prayer of the person's tradition (EO mornings), in the floor. */
  traditionPrayer?: Movement;
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
  // A rotating prayer of the tradition rides with the opening, in the floor.
  push(
    ctx.traditionPrayer && { ...ctx.traditionPrayer, kind: "tradition-prayer", level: 1 },
  );
  push(OPENING_LINE);

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

  // The Gospel song belongs to the full office: the top of each part's spine.
  push(ctx.song && { ...ctx.song, kind: "song", level: MAX_LEVEL[part] });

  // The Protestant/Evangelical rule draws its depth from the undivided Church:
  // the Apostles' Creed in the fuller office, and the early canticles and the
  // original Nicene Creed as opt-ins that extend the session.
  const protEvang = isProtEvang(tradition);
  if (protEvang) {
    push({ ...APOSTLES_CREED, kind: "creed", level: 4 });
    push({ ...NICENE_CREED, kind: "creed", level: MAX_LEVEL[part], optional: true });
    for (const c of earlyChurchCanticles(part)) {
      push({ ...c, kind: "canticle", level: MAX_LEVEL[part], optional: true });
    }
  }

  // Prayer with the early Church (the intercessory cycle). For Protestant and
  // Evangelical it is the formative core, kept all but the smallest session.
  push(ctx.cycle && { ...ctx.cycle, kind: "cycle", level: protEvang ? 2 : 3 });

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
  "tradition-prayer",
  "opening-line",
  "night-psalm",
  "lords",
  "prayer-night",
  "doxology",
  "closing",
]);

/** Initial include state for a chosen spine level (opt-ins stay off). */
export function defaultIncluded(movements: Movement[], level: number): boolean[] {
  return movements.map((m) => !m.optional && (m.level ?? 1) <= level);
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


// ── The EO Matins-shaped morning ─────────────────────────────────────────────
//
// Same arc every day, scaled in resolution by the slider: the fixed spine is
// always present, and the slider adds resolution — psalms one at a time
// (interleaved with the propers, so one psalm survives deep into the small
// sessions), the day's kontakion and remembrance, the featured fragment, and
// at the top the Great Doxology. The Gospel and the intercessory cycle are
// opt-ins that extend the session beyond the slider's budget.

/** The value rank, floor (1) → full (10). */
export const MATINS_MAX_LEVEL = 10;
const MATINS_PSALM_LEVELS = [7, 10];

export type MatinsCtx = {
  tradition: Tradition | null;
  /** Up to two Psalter-walk units (the walk continues here as everywhere). */
  psalmMovements: Movement[];
  /** The Matins psalm — the fixed eleven-psalm loop, on its own pointer. */
  matinsPsalm?: Movement;
  /** "A Morning Prayer" — the rotating classic morning prayer. */
  traditionPrayer?: Movement;
  /** The saint of the day's troparion / kontakion (sourced), or a gap flag. */
  troparion?: Movement;
  kontakion?: Movement;
  /** The fixed day-of-week remembrance. */
  theme: Movement;
  /** The featured window into Orthros (the familiarity rotation). */
  fragment: Movement;
  /** The day's Gospel (absent once done) and the intercessory cycle. */
  gospel?: Movement;
  cycle?: Movement;
  intentions: Intention[];
  date: string;
};

export function assembleMatins(ctx: MatinsCtx): Movement[] {
  const { tradition } = ctx;
  const out: Movement[] = [];
  const push = (m: Movement | undefined | false) => {
    if (m) out.push(m);
  };

  // The fixed spine, in service order.
  if (tradition) {
    const meta = TRADITION_META[tradition];
    push({
      kind: "tradition-opening",
      level: 1,
      label: meta.opening.label,
      text: meta.opening.text,
    });
  }
  push({ ...TRISAGION, kind: "trisagion", level: 1 });
  push(LORDS_PRAYER);
  push(ctx.traditionPrayer && { ...ctx.traditionPrayer, kind: "tradition-prayer", level: 1 });

  // The Psalms of Matins: the fixed loop (Six Psalms, Polyeleos, Praises).
  push(ctx.matinsPsalm && { ...ctx.matinsPsalm, kind: "matins-psalm", level: 4 });

  // The Psalter walk: two psalms, returning as the slider rises.
  ctx.psalmMovements.forEach((p, i) => {
    push({ ...p, kind: "psalm", level: MATINS_PSALM_LEVELS[i] ?? MATINS_PSALM_LEVELS[1] });
  });

  // The day's propers: the troparion belongs to the floor; the kontakion and
  // the weekday remembrance arrive as the session grows.
  push(ctx.troparion && { ...ctx.troparion, kind: "troparion", level: 1 });
  // The kontakion and the day's remembrance arrive together, as a pair.
  push(ctx.kontakion && { ...ctx.kontakion, kind: "kontakion", level: 5 });
  push({ ...ctx.theme, kind: "theme", level: 5 });

  // The day's Gospel — the last thing standing above the bare floor; if it is
  // trimmed away (or the morning skipped), the carry surfaces it in the evening.
  push(ctx.gospel && { ...ctx.gospel, level: 2 });

  // The featured fragment — one window into Orthros per session.
  push({ ...ctx.fragment, kind: "fragment", level: 8 });

  // Prayer with the early Church, in the heart of the session.
  push(ctx.cycle && { ...ctx.cycle, kind: "cycle", level: 6 });

  // Your prayer list — held space, kept deep into small sessions.
  if (intentionsForDate(ctx.intentions, ctx.date).length) {
    const meta = tradition ? TRADITION_META[tradition] : null;
    const close = meta ? meta.intercessionClose : INTERCESSION_AFTER;
    const names = intercessionBody(ctx.intentions, ctx.date);
    push({
      kind: "intercession",
      level: 3,
      label: "Your prayer list",
      text: `${INTERCESSION_BEFORE}\n\n${names}\n\n${close}`,
      ...(meta?.intercessionCloseAttribution
        ? { source: meta.intercessionCloseAttribution }
        : {}),
    });
  }

  // The summit, then the close.
  push({ ...GREAT_DOXOLOGY, kind: "great-doxology", level: 9 });
  push({ ...DISMISSAL, kind: "dismissal", level: 1 });

  // Cross marks, as everywhere.
  if (tradition && TRADITION_META[tradition].crosses) {
    for (const m of out) {
      if (
        m.kind === "tradition-opening" ||
        m.kind === "trisagion" ||
        m.kind === "great-doxology"
      ) {
        m.cross = true;
      }
    }
  }

  return out;
}

// ── The EO Vespers-shaped evening ────────────────────────────────────────────
//
// The evening counterpart of assembleMatins: the same arc every evening,
// scaled in resolution by the slider. The fixed spine is always present; the
// rank climbs through the carried Gospel, the names, the psalms of Vespers,
// O Gladsome Light with the prokeimenon, the early Church, the Psalter walk,
// the close of Vespers, and the Epistle at the summit.

/** The value rank, floor (1) → full (10). */
export const VESPERS_MAX_LEVEL = 10;
const VESPERS_WALK_LEVELS = [7, 10];

export type VespersCtx = {
  tradition: Tradition | null;
  /** Up to two Psalter-walk units (the walk continues here as everywhere). */
  psalmMovements: Movement[];
  /** "An evening prayer of the Church", the rotating before-sleep prayer. */
  traditionPrayer?: Movement;
  /** The saint of the day's troparion (sourced), or a gap flag. */
  troparion?: Movement;
  /** The Vespers psalm, from the six-stop loop on its own pointer. */
  vespersPsalm?: Movement;
  /** The prokeimenon of the day (fixed per weekday). */
  prokeimenon: Movement;
  /** The day's Gospel, present only when it carried from the morning. */
  gospel?: Movement;
  /** The Epistle (evening-only, once daily). */
  epistle?: Movement;
  cycle?: Movement;
  intentions: Intention[];
  date: string;
};

export function assembleVespers(ctx: VespersCtx): Movement[] {
  const { tradition } = ctx;
  const out: Movement[] = [];
  const push = (m: Movement | undefined | false) => {
    if (m) out.push(m);
  };

  if (tradition) {
    const meta = TRADITION_META[tradition];
    push({
      kind: "tradition-opening",
      level: 1,
      label: meta.opening.label,
      text: meta.opening.text,
    });
  }
  push(ctx.traditionPrayer && { ...ctx.traditionPrayer, kind: "tradition-prayer", level: 1 });

  // The psalmody: the Vespers psalm, then the walk through the whole Psalter.
  push(ctx.vespersPsalm && { ...ctx.vespersPsalm, kind: "vespers-psalm", level: 4 });
  ctx.psalmMovements.forEach((p, i) => {
    push({ ...p, kind: "psalm", level: VESPERS_WALK_LEVELS[i] ?? VESPERS_WALK_LEVELS[1] });
  });

  // The evening hymn and the prokeimenon arrive together, as a pair.
  push({ ...GLADSOME_LIGHT, kind: "phos", level: 5 });
  push({ ...ctx.prokeimenon, kind: "prokeimenon", level: 5 });

  // The Epistle is the evening's summit; the Gospel appears only as a carry.
  push(ctx.epistle && { ...ctx.epistle, level: 9 });
  push(ctx.gospel && { ...ctx.gospel, level: 2 });

  // The close of Vespers, as one window.
  push({ ...VESPERS_WINDOW, kind: "vespers-window", level: 8 });

  push(ctx.cycle && { ...ctx.cycle, kind: "cycle", level: 6 });

  if (intentionsForDate(ctx.intentions, ctx.date).length) {
    const meta = tradition ? TRADITION_META[tradition] : null;
    const close = meta ? meta.intercessionClose : INTERCESSION_AFTER;
    push({
      ...intercessionMovement(
        ctx.intentions,
        ctx.date,
        close,
        meta?.intercessionCloseAttribution,
      ),
      level: 3,
    });
  }

  // The night's close: Trisagion and Our Father come late in Vespers, before
  // the troparion and the prayers for sleep.
  push({ ...TRISAGION, kind: "trisagion", level: 1 });
  push(LORDS_PRAYER);
  push(ctx.troparion && { ...ctx.troparion, kind: "troparion", level: 1 });
  push(NIGHT_PSALM);
  push(PRAYER_NIGHT);
  push({ ...DISMISSAL, kind: "dismissal", level: 1 });

  if (tradition && TRADITION_META[tradition].crosses) {
    for (const m of out) {
      if (m.kind === "tradition-opening" || m.kind === "trisagion" || m.kind === "phos") {
        m.cross = true;
      }
    }
  }

  return out;
}
