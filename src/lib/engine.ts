/**
 * The compliance engine.
 *
 * It reads a log of daily yes/no check-ins and decides, gently, whether the
 * person is ready to be offered the next rung, or whether the rule should be
 * simplified down a rung. It never advances on its own — advancement is always
 * offered and opted into. Simplification is suggested, not forced.
 *
 * All thresholds live in ENGINE_CONFIG so they are trivial to tune later.
 */

import { FIRST_RUNG, LAST_RUNG } from "./ladder";

export type CheckIn = {
  /** Local calendar date, "YYYY-MM-DD". */
  date: string;
  /** Did they keep the goal that day? */
  kept: boolean;
};

export const ENGINE_CONFIG = {
  /** Days kept, out of the rolling window, needed to be offered the next rung. */
  advanceKeptOf: 5,
  /** The rolling window size in days. */
  window: 7,
  /** Consecutive missed days that trigger a gentle offer to simplify. */
  simplifyAfterMissedStreak: 3,
  /** Minimum check-ins before we offer to advance (don't advance on day one). */
  minCheckInsBeforeAdvance: 5,
};

/** The Christian tradition a person prays within (alphabetical). */
export type Tradition =
  | "anglican"
  | "eastern-orthodox"
  | "evangelical"
  | "protestant"
  | "roman-catholic";

/**
 * Elements an experienced person already practices, switched on so the app
 * integrates their routine. Additive only: these add to a rung, never remove.
 */
export type Prefs = {
  scripture: boolean;
  psalter: boolean;
  silence: boolean;
  jesusPrayer: boolean;
  rosary: boolean;
  dailyOffice: boolean;
  /** Layer 3 — the litany below the readings. */
  litany: boolean;
  /** Recorded but intentionally without fixed content for now. */
  devotional: boolean;
};

export const NO_PREFS: Prefs = {
  scripture: false,
  psalter: false,
  silence: false,
  jesusPrayer: false,
  rosary: false,
  dailyOffice: false,
  litany: false,
  devotional: false,
};

export type RuleState = {
  /** Whether onboarding is complete. */
  onboarded: boolean;
  /** The tradition chosen at first launch; null if not yet chosen. */
  tradition: Tradition | null;
  /** Elements the person already practices, added on top of their rung. */
  prefs: Prefs;
  /** Current rung index into the LADDER. */
  rung: number;
  /** Chronological check-in log (oldest first). */
  log: CheckIn[];
  /** Personal prayer intentions held before God. */
  intentions: Intention[];
  /** Rungs the user has declined to advance to, by the date they declined. */
  lastAdvanceDismissed?: string;
  /** Position in the 60-portion Psalter rotation (0–59). */
  psalmIndex: number;
  /** Which daily prayer carries the rotating Psalm portion. */
  psalmTime: "morning" | "evening";
  /** Which daily prayer carries the intercessions (the prayer list). */
  petitionTime: "morning" | "evening";
  /** Local date the Psalter last advanced, so it moves once per day. */
  lastPsalmAdvanceDate?: string;
  /** Dev/preview only: override "today" (YYYY-MM-DD) to time-travel. */
  previewDate?: string;
  /** Reminder clock times ("HH:MM", 24h) for the calendar alarm; null = off. */
  reminders: { morning: string | null; evening: string | null };
  /**
   * The intercessory cycle — a usage-advanced track (its own pointer, like the
   * Psalter). `day` is the Cycle Day (starts at 1), advancing one step per
   * completion; it freezes while `on` is false and resumes in place. The
   * Prologue is served once before Day 1, gated by `prologueSeen`.
   * `lastAdvanceDate` is a same-day safety latch against double-taps/reopens.
   */
  cycle: {
    day: number;
    on: boolean;
    prologueSeen: boolean;
    lastAdvanceDate?: string;
  };
};

export type Cadence = "daily" | "weekly";

export type Intention = {
  id: string;
  text: string;
  /** Local date added. */
  added: string;
  answered: boolean;
  /** Daily names are prayed every day; weekly names rotate, once a week. */
  cadence: Cadence;
  /** For weekly names: the weekday (0=Sun…6=Sat) they come up on. */
  bucket?: number;
};

/** Treat a saved intention with no cadence (older data) as daily. */
export function cadenceOf(i: Intention): Cadence {
  return i.cadence ?? "daily";
}

/** The weekday (0=Sun…6=Sat) for a local "YYYY-MM-DD" date. */
export function weekdayOf(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

/**
 * The intentions to pray on a given day: every daily name, plus the weekly
 * names whose rotation slot lands on today's weekday. Answered names drop out.
 */
export function intentionsForDate(
  intentions: Intention[],
  date: string,
): Intention[] {
  const wd = weekdayOf(date);
  return intentions.filter((i) => {
    if (i.answered) return false;
    if (cadenceOf(i) === "daily") return true;
    return (i.bucket ?? 0) % 7 === wd;
  });
}

/** The weekday slot to give the next weekly name, spreading them evenly. */
export function nextWeeklyBucket(intentions: Intention[]): number {
  const weeklyCount = intentions.filter((i) => cadenceOf(i) === "weekly").length;
  return weeklyCount % 7;
}

export function initialState(): RuleState {
  return {
    onboarded: false,
    tradition: null,
    prefs: { ...NO_PREFS },
    rung: FIRST_RUNG,
    log: [],
    intentions: [],
    psalmIndex: 0,
    psalmTime: "morning",
    petitionTime: "morning",
    reminders: { morning: null, evening: null },
    cycle: { day: 1, on: false, prologueSeen: false },
  };
}

/** Local "YYYY-MM-DD" for a given Date (defaults to now). */
export function localDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todaysCheckIn(state: RuleState, today: string): CheckIn | undefined {
  return state.log.find((c) => c.date === today);
}

/** Count kept days within the rolling window (most recent N entries). */
export function keptInWindow(log: CheckIn[], window = ENGINE_CONFIG.window): number {
  return log.slice(-window).filter((c) => c.kept).length;
}

/** Length of the current trailing streak of missed days. */
export function missedStreak(log: CheckIn[]): number {
  let n = 0;
  for (let i = log.length - 1; i >= 0; i--) {
    if (log[i].kept) break;
    n++;
  }
  return n;
}

/** Length of the current trailing streak of kept days (for gentle encouragement). */
export function keptStreak(log: CheckIn[]): number {
  let n = 0;
  for (let i = log.length - 1; i >= 0; i--) {
    if (!log[i].kept) break;
    n++;
  }
  return n;
}

export type Guidance =
  | { kind: "advance"; from: number; to: number; kept: number; of: number }
  | { kind: "simplify"; from: number; to: number; missed: number }
  | { kind: "steady" };

/**
 * Decide what, if anything, to gently offer the user right now.
 * Pure function of the rule state — easy to test and tune.
 */
export function guidance(state: RuleState): Guidance {
  const { log, rung } = state;
  const kept = keptInWindow(log);
  const missed = missedStreak(log);

  if (
    rung < LAST_RUNG &&
    log.length >= ENGINE_CONFIG.minCheckInsBeforeAdvance &&
    kept >= ENGINE_CONFIG.advanceKeptOf
  ) {
    return { kind: "advance", from: rung, to: rung + 1, kept, of: ENGINE_CONFIG.window };
  }

  if (rung > FIRST_RUNG && missed >= ENGINE_CONFIG.simplifyAfterMissedStreak) {
    return { kind: "simplify", from: rung, to: rung - 1, missed };
  }

  return { kind: "steady" };
}
