/**
 * TRACK B — the date-anchored Gospel calendar (LITURGY_CALENDAR Parts 1 & 2).
 * A flat 'MM-DD' lookup of the morning and evening Gospel for the day.
 *
 * NOTE: the spec files supplied only the four sample dates below; the remaining
 * ~361 dates were placeholders ("[Remaining dates … match this key pattern]").
 * Add them here as they become available — keys are 'MM-DD', year-independent.
 * Until a date is present, the app falls back to the bundled daily lectionary.
 */

export type GospelReading = { ref: string; text: string };
export type CalendarEntry = { morning?: GospelReading; evening?: GospelReading };

export const CALENDAR_GOSPELS: Record<string, CalendarEntry> = {
  "01-01": {
    morning: {
      ref: "John 1:1–5",
      text: "In the beginning was the Word, and the Word was with God, and the Word was God...",
    },
    evening: {
      ref: "John 1:29–34",
      text: "Behold, the Lamb of God, who takes away the sin of the world...",
    },
  },
  "06-06": {
    morning: {
      ref: "John 5:24–27",
      text: "He who hears my word, and believes him who sent me, has eternal life...",
    },
    evening: {
      ref: "John 5:28–30",
      text: "Don't marvel at this, for the hour comes in which all that are in the tombs will hear his voice...",
    },
  },
  "07-01": {
    morning: {
      ref: "Matthew 5:1–12",
      text: "Seeing the multitudes, he went up onto the mountain. When he had sat down, his disciples came to him...",
    },
    evening: {
      ref: "Matthew 5:13–16",
      text: "You are the salt of the earth, but if the salt has lost its flavor, with what will it be salted?...",
    },
  },
  "12-25": {
    morning: {
      ref: "Luke 2:1–14",
      text: "Now it happened in those days, that a decree went out from Caesar Augustus...",
    },
    evening: {
      ref: "John 1:14–18",
      text: "The Word became flesh, and lived among us...",
    },
  },
};

/** 'YYYY-MM-DD' → 'MM-DD'. */
export function mmddOf(date: string): string {
  return date.slice(5);
}

/** The Gospel for a date's part, or undefined if that date isn't in the matrix. */
export function calendarGospel(
  date: string,
  part: "morning" | "evening",
): GospelReading | undefined {
  return CALENDAR_GOSPELS[mmddOf(date)]?.[part];
}
