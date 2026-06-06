/**
 * Turns a practice's authored steps into the concrete movements prayed today.
 *
 * Most steps are fixed text. Some are "dynamic": the daily Gospel, the daily
 * Gospel with its Epistle, or the intercession that wraps the names from the
 * person's own prayer list. Those are resolved here against today's readings
 * and intentions, so the reader only ever deals with finished movements.
 */

import type { Practice, PrayerStep } from "./ladder";
import { intentionsForDate, type Intention } from "./engine";
import type { DayReadings } from "./readings";
import type { DayPart } from "./daypart";

export type Movement = {
  label: string;
  text: string;
  source?: string;
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

function gospelMovement(day?: DayReadings): Movement {
  if (day?.gospel) {
    const name = evangelist(day.gospel.ref);
    const intro = name
      ? `The reading of the Holy Gospel according to Saint ${name}.`
      : "The reading of the Holy Gospel.";
    return {
      label: "The Holy Gospel",
      text: `${intro}\n\nGlory to Thee, O God. Glory to Thee, O God. Glory to Thee.\n\nLet us attend.\n\n${day.gospel.text}`,
      source: day.gospel.ref,
    };
  }
  if (day?.appointed) {
    return {
      label: "Today's Reading",
      text: day.appointed.text,
      source: day.appointed.ref,
      note: "No Gospel is appointed today; this is the reading set for the day.",
    };
  }
  return PSALM_FALLBACK;
}

function intercessionMovement(intentions: Intention[], date: string): Movement {
  // Daily names every day, plus the weekly names whose rotation lands today.
  const today = intentionsForDate(intentions, date).map((i) => i.text);
  const names = today.length
    ? today.join("\n")
    : "(bring to mind those you carry, and name them before God)";
  return {
    label: "Intercession",
    text: `${INTERCESSION_BEFORE}\n\n${names}\n\n${INTERCESSION_AFTER}`,
  };
}

function expandStep(step: PrayerStep, ctx: ResolveCtx): Movement[] {
  switch (step.dynamic) {
    case "gospel":
      return [gospelMovement(ctx.day)];
    case "gospelEpistle": {
      const out: Movement[] = [];
      if (ctx.day?.epistle) {
        out.push({
          label: "The Epistle",
          text: ctx.day.epistle.text,
          source: ctx.day.epistle.ref,
        });
      }
      out.push(gospelMovement(ctx.day));
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

export function resolvePractice(practice: Practice, ctx: ResolveCtx): Movement[] {
  const movements = practice.steps.flatMap((s) => expandStep(s, ctx));

  // The prayer list is prayed in whichever practice the person chose, and only
  // when there are names for today — so prayers without a list stay simple.
  if (ctx.part === ctx.petitionTime) {
    const names = intentionsForDate(ctx.intentions, ctx.date);
    if (names.length) {
      const intercession = intercessionMovement(ctx.intentions, ctx.date);
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
