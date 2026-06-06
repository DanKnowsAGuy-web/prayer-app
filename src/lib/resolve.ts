/**
 * Turns a practice's authored steps into the concrete movements prayed today.
 *
 * Most steps are fixed text. Some are "dynamic": the daily Gospel, the daily
 * Gospel with its Epistle, or the intercession that wraps the names from the
 * person's own prayer list. Those are resolved here against today's readings
 * and intentions, so the reader only ever deals with finished movements.
 */

import type { Practice, PrayerStep } from "./ladder";
import type { Intention } from "./engine";
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
};

/** The standard prayers said around the names of those being interceded for. */
export const INTERCESSION_BEFORE =
  "O Lord Jesus Christ, who bade us pray for one another, receive those I now bring before You by name:";
export const INTERCESSION_AFTER =
  "Remember them, O Lord, in Your mercy. Grant them health and salvation, guard them from all evil, and visit them with Your grace. For You are good and love mankind, and to You we give glory. Amen.";

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

function intercessionMovement(intentions: Intention[]): Movement {
  const active = intentions.filter((i) => !i.answered).map((i) => i.text);
  const names = active.length
    ? active.join("\n")
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
    case "intercession":
      return [intercessionMovement(ctx.intentions)];
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

export function resolvePractice(practice: Practice, ctx: ResolveCtx): Movement[] {
  return practice.steps.flatMap((s) => expandStep(s, ctx));
}
