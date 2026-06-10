/**
 * The day's liturgical color and fasting line for the EO home screen — quiet,
 * desaturated accents, never loud. Derived from the bundled propers (days from
 * Pascha, feast rank, fast level), nothing computed beyond simple windows.
 */
import type { ProperDay } from "./propers";

export type DayAccent = {
  /** A muted OKLCH color for the day's title, or undefined for the default. */
  color?: string;
  /** The season or feast named, e.g. "Great Lent" or the feast's name. */
  label?: string;
};

/** Subtle, low-chroma accents in the app's earthen palette. */
const GOLD = "oklch(0.78 0.07 85)";
const GREEN = "oklch(0.68 0.06 140)";
const PURPLE = "oklch(0.66 0.05 310)";

/** "MM-DD" for fixed-date windows. */
function monthDay(date: string): string {
  return date.slice(5);
}

export function dayAccent(date: string, day?: ProperDay): DayAccent {
  if (!day) return {};

  // A great feast outshines the season (orthocal feast_level 7 = great).
  if ((day.feast?.level ?? 0) >= 7 && day.feast?.names?.length) {
    return { color: GOLD, label: day.feast.names[0] };
  }

  const pd = day.pd;
  if (typeof pd === "number") {
    if (pd >= -48 && pd < -7) return { color: PURPLE, label: "Great Lent" };
    if (pd >= -7 && pd < 0) return { color: PURPLE, label: "Holy Week" };
    if (pd >= 0 && pd <= 38) return { color: GOLD, label: "Pascha" };
    if (pd >= 49 && pd <= 55) return { color: GREEN, label: "Pentecost" };
  }

  const md = monthDay(date);
  if (md >= "12-25" || md <= "01-04") {
    return { color: GOLD, label: "The Nativity of Christ" };
  }
  return {};
}

/** The fasting line for the day, or null when there is nothing to say. */
export function fastLine(day?: ProperDay): string | null {
  if (!day?.fast) return null;
  const { level, desc, exception } = day.fast;
  if (!level || !desc || /no fast/i.test(desc)) {
    return /fast[- ]free/i.test(exception || "") ? "Fast-free week" : null;
  }
  return exception
    ? `${desc} (${exception.toLowerCase()})`
    : `${desc} (strict fast)`;
}
