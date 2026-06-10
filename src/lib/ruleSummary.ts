/**
 * Builds the short rule summary shared with one's spiritual father (EO
 * edition): a sentence or two on how often and what, generated from the
 * prayer history (AmenRecord) and editable before sending.
 */
import type { AmenRecord } from "./engine";

export type SummaryWindow = 7 | 14 | 30;

const WINDOW_PHRASE: Record<SummaryWindow, string> = {
  7: "week",
  14: "two weeks",
  30: "month",
};

/** Days from `from` to `to` inclusive, both local "YYYY-MM-DD". */
function daySpan(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const ms = new Date(ty, tm - 1, td).getTime() - new Date(fy, fm - 1, fd).getTime();
  return Math.round(ms / 86400000) + 1;
}

/** The local date `days - 1` days before `to` (the window's first day). */
function windowStart(to: string, days: number): string {
  const [y, m, d] = to.split("-").map(Number);
  const dt = new Date(y, m - 1, d - (days - 1));
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

/**
 * Which summary windows the history can honestly support: a window is offered
 * only once the person has been praying at least that long (their first
 * recorded Amen is at least the window's length ago).
 */
export function availableWindows(amens: AmenRecord[], today: string): SummaryWindow[] {
  if (!amens.length) return [];
  const span = daySpan(amens[0].date, today);
  return ([7, 14, 30] as SummaryWindow[]).filter((w) => span >= w);
}

/** The records that fall inside the window ending today. */
function inWindow(amens: AmenRecord[], today: string, days: number): AmenRecord[] {
  const start = windowStart(today, days);
  return amens.filter((a) => a.date >= start && a.date <= today);
}

/** "the Psalms in course, the daily Gospel and Epistle, and intercessions" */
function contentPhrase(records: AmenRecord[]): string {
  const kinds = new Set(records.flatMap((r) => r.kinds));
  const parts: string[] = [];
  if (kinds.has("psalm")) parts.push("the Psalms in course");
  if (kinds.has("gospel") && kinds.has("epistle")) {
    parts.push("the daily Gospel and Epistle");
  } else if (kinds.has("gospel")) {
    parts.push("the daily Gospel");
  } else if (kinds.has("epistle")) {
    parts.push("the daily Epistle");
  }
  if (kinds.has("intercession") || kinds.has("cycle")) parts.push("intercessions");
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

/** The auto-generated message, ready to preview and edit. */
export function buildSummary(
  amens: AmenRecord[],
  window: SummaryWindow,
  today: string,
  name: string,
): string {
  const records = inWindow(amens, today, window);
  const mornings = records.filter((r) => r.part === "morning");
  const evenings = records.filter((r) => r.part === "evening");

  const kept: string[] = [];
  if (mornings.length) kept.push(`morning prayer ${mornings.length} of ${window} days`);
  if (evenings.length) {
    kept.push(
      mornings.length
        ? `evening prayer ${evenings.length} of ${window}`
        : `evening prayer ${evenings.length} of ${window} days`,
    );
  }
  const keptPhrase = kept.length ? kept.join(" and ") : `prayer on none of the ${window} days`;

  const content = contentPhrase(records);
  const avgSecs =
    mornings.length > 0
      ? mornings.reduce((s, r) => s + r.secs, 0) / mornings.length
      : records.length
        ? records.reduce((s, r) => s + r.secs, 0) / records.length
        : 0;
  const minutes = Math.max(1, Math.round(avgSecs / 60));
  const which = mornings.length ? "in the morning" : "each time";

  let msg = `Father, bless. Over the last ${WINDOW_PHRASE[window]} I've kept ${keptPhrase}`;
  if (content) msg += `, usually ${content}, about ${minutes} minutes ${which}`;
  msg += ".";
  if (name.trim()) msg += `\n${name.trim()}`;
  return msg;
}
