/**
 * Access to the bundled daily lectionary (see scripts/build-readings.mjs).
 * The dataset is loaded lazily as its own chunk so it never weighs down
 * first paint. Once loaded it's cached for the session.
 */

export type Reading = { source: string; ref: string; text: string };

type Day = { title: string; readings: Reading[] };
type Bundle = {
  translation: string;
  source: string;
  start: string;
  end: string;
  days: Record<string, Day>;
};

let cache: Bundle | null = null;

export async function loadReadings(): Promise<Bundle> {
  if (!cache) {
    const mod = await import("../data/readings.json");
    cache = (mod.default ?? mod) as unknown as Bundle;
  }
  return cache;
}

export type DayReadings = {
  /** Whether the date falls inside the bundled range at all. */
  inRange: boolean;
  title: string;
  gospel?: Reading;
  epistle?: Reading;
  /** First appointed reading when there is no Gospel (e.g. Lenten weekdays). */
  appointed?: Reading;
};

export function readingsForDay(bundle: Bundle, date: string): DayReadings {
  const day = bundle.days[date];
  if (!day) return { inRange: false, title: "" };
  const gospel = day.readings.find((r) => r.source === "Gospel");
  const epistle = day.readings.find((r) => r.source === "Epistle");
  const appointed = day.readings[0];
  return { inRange: true, title: day.title, gospel, epistle, appointed };
}
