/**
 * Turns a practice's authored steps into the concrete movements prayed today.
 *
 * Most steps are fixed text. Some are "dynamic": the daily Gospel, the daily
 * Gospel with its Epistle, or the intercession that wraps the names from the
 * person's own prayer list. Those are resolved here against today's readings
 * and intentions, so the reader only ever deals with finished movements.
 */

import type { Practice, PrayerStep } from "./ladder";
import {
  intentionsForDate,
  type Intention,
  type Prefs,
  type Tradition,
} from "./engine";
import type { DayReadings } from "./readings";
import type { DayPart } from "./daypart";
import { TRADITION_META } from "./traditions";

export type Movement = {
  label: string;
  text: string;
  /** Citation shown beneath the text (e.g. an Epistle reference). */
  source?: string;
  /** Citation shown above the text, so you know what you're about to read. */
  ref?: string;
  note?: string;
  /** Marks a movement that came from the rotating Psalter portion. */
  kind?: "psalm";
};

/** Everything a practice needs to resolve its dynamic steps for today. */
export type ResolveCtx = {
  day?: DayReadings;
  intentions: Intention[];
  /** Which practice is being prayed now. */
  part: DayPart;
  /** Which practice the user has chosen to carry the Psalm portion. */
  psalmTime: DayPart;
  /** The current Psalter portion, already built from the bundle. */
  psalmMovements: Movement[];
  /** Today's local date ("YYYY-MM-DD"), for the weekly intercession rotation. */
  date: string;
  /** Which practice carries the intercessions (the prayer list). */
  petitionTime: DayPart;
  /** The person's tradition, for opening prayer and intercession closing. */
  tradition: Tradition | null;
  /** Elements the person already practices, added on top of the rung. */
  prefs: Prefs;
};

const SILENCE_MOVEMENT: Movement = {
  label: "Silence",
  text: "Rest quietly before God for a moment.",
  note: "Sit in silence, unhurried, for as long as feels natural.",
};

/** The standard prayers said around the names of those being interceded for. */
export const INTERCESSION_BEFORE =
  "Lord, listen to the petition of our prayers, unworthy as we may be, and grant all good things profitable for our souls and salvation. For the servants of God we pray, Lord, have mercy:";
export const INTERCESSION_AFTER =
  "Lord, as You will and as You know, have mercy on us and save us, for You are good and love mankind.\n\nThrough the prayers of the holy fathers and holy mothers and all the saints who have gone before us, have mercy on us and save us.\n\nIn the name of the Father, and the Son, and the Holy Spirit. Amen.";

/** A quiet fallback when no scripture is appointed and none is bundled. */
const PSALM_FALLBACK: Movement = {
  label: "A Psalm",
  text: "The Lord is my shepherd; I shall not want.\nHe maketh me to lie down in green pastures;\nhe leadeth me beside the still waters.\nHe restoreth my soul.",
  source: "Psalm 23:1–3",
};

/** The evangelist's name from a citation like "Matthew 5.42-48". */
function evangelist(ref: string): string {
  const m = ref.match(/^[1-3]?\s?[A-Za-z]+/);
  return m ? m[0].trim() : "";
}

/** "Matthew 5.42-48" -> "Matthew 5:42–48", shown before the reading. */
function formatRef(ref: string): string {
  return ref.replace(".", ":").replace(/-/g, "–");
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

function gospelMovement(
  day: DayReadings | undefined,
  tradition: Tradition | null,
): Movement {
  if (day?.gospel) {
    const name = evangelist(day.gospel.ref);
    return {
      label: "The Holy Gospel",
      ref: formatRef(day.gospel.ref),
      text: `${gospelAnnounce(name, tradition)}\n\n${day.gospel.text}`,
    };
  }
  if (day?.appointed) {
    return {
      label: "Today's Reading",
      ref: formatRef(day.appointed.ref),
      text: day.appointed.text,
      note: "No Gospel is appointed today; this is the reading set for the day.",
    };
  }
  return PSALM_FALLBACK;
}

function intercessionMovement(
  intentions: Intention[],
  date: string,
  close: string,
): Movement {
  // Daily names every day, plus the weekly names whose rotation lands today.
  const today = intentionsForDate(intentions, date).map((i) => i.text);
  const names = today.length
    ? today.join("\n")
    : "(bring to mind those you carry, and name them before God)";
  return {
    label: "Intercession",
    text: `${INTERCESSION_BEFORE}\n\n${names}\n\n${close}`,
  };
}

function expandStep(step: PrayerStep, ctx: ResolveCtx): Movement[] {
  switch (step.dynamic) {
    case "gospel":
      return [gospelMovement(ctx.day, ctx.tradition)];
    case "gospelEpistle": {
      const out: Movement[] = [];
      if (ctx.day?.epistle) {
        out.push({
          label: "The Epistle",
          ref: formatRef(ctx.day.epistle.ref),
          text: ctx.day.epistle.text,
        });
      }
      out.push(gospelMovement(ctx.day, ctx.tradition));
      return out;
    }
    case "psalm":
      // The Psalm portion belongs only to the prayer the user chose for it.
      return ctx.part === ctx.psalmTime
        ? ctx.psalmMovements.map((m) => ({ ...m, kind: "psalm" as const }))
        : [];
    default:
      return [
        { label: step.label, text: step.text, source: step.source, note: step.note },
      ];
  }
}

/** Movements that conclude a practice; intercessions go just before these. */
const CLOSING = /closing prayer|prayer for the night/i;
const LORDS = /lord's prayer/i;

/** Where added elements slot in: before the Lord's Prayer, else the closing. */
function bodyEnd(movements: Movement[]): number {
  const lords = movements.findIndex((m) => LORDS.test(m.label));
  if (lords >= 0) return lords;
  const closing = movements.findIndex((m) => CLOSING.test(m.label));
  if (closing >= 0) return closing;
  return movements.length;
}

export function resolvePractice(practice: Practice, ctx: ResolveCtx): Movement[] {
  const movements: Movement[] = [];

  // A tradition-specific opening prayer begins the office.
  if (ctx.tradition) {
    const opening = TRADITION_META[ctx.tradition].opening;
    movements.push({ label: opening.label, text: opening.text });
  }

  movements.push(...practice.steps.flatMap((s) => expandStep(s, ctx)));

  // Additive preferences: include what an experienced person already practices,
  // only when the rung doesn't already provide it. Slotted into the body, in a
  // natural order (Psalms, then Scripture, then silence).
  const additions: Movement[] = [];
  const has = (test: (m: Movement) => boolean) => movements.some(test);

  if (
    ctx.prefs.psalter &&
    ctx.part === ctx.psalmTime &&
    !has((m) => m.kind === "psalm")
  ) {
    additions.push(...ctx.psalmMovements.map((m) => ({ ...m, kind: "psalm" as const })));
  }
  if (
    ctx.prefs.scripture &&
    ctx.part === "morning" &&
    !has((m) => m.label === "The Holy Gospel" || m.label === "Today's Reading")
  ) {
    additions.push(gospelMovement(ctx.day, ctx.tradition));
  }
  if (ctx.prefs.silence && !has((m) => /silence/i.test(m.label))) {
    additions.push(SILENCE_MOVEMENT);
  }
  if (additions.length) {
    movements.splice(bodyEnd(movements), 0, ...additions);
  }

  // The prayer list is prayed in whichever practice the person chose, and only
  // when there are names for today — so prayers without a list stay simple.
  if (ctx.part === ctx.petitionTime) {
    const names = intentionsForDate(ctx.intentions, ctx.date);
    if (names.length) {
      const close = ctx.tradition
        ? TRADITION_META[ctx.tradition].intercessionClose
        : INTERCESSION_AFTER;
      const intercession = intercessionMovement(ctx.intentions, ctx.date, close);
      const last = movements[movements.length - 1];
      if (last && CLOSING.test(last.label)) {
        movements.splice(movements.length - 1, 0, intercession);
      } else {
        movements.push(intercession);
      }
    }
  }

  return movements;
}
