export type DayPart = "morning" | "evening";

/** Which practice the day is leaning toward, by local hour. */
export function dayPart(d: Date): DayPart {
  const h = d.getHours();
  // Before 4pm leans morning; after, evening.
  return h < 16 ? "morning" : "evening";
}

export function greeting(d: Date): string {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function longDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
