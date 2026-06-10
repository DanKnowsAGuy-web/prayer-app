/**
 * Rough time estimates for a prayer's segments, used by the build-out preview.
 * Prayer is read unhurried, often aloud, so the rate is deliberately slow.
 * These are approximate by design — they help the person budget, not stopwatch.
 */
import type { Movement } from "./resolve";

const WORDS_PER_MINUTE = 100;
export function estimateSeconds(m: Movement): number {
  const trimmed = m.text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const secs = (words / WORDS_PER_MINUTE) * 60;
  return Math.max(12, Math.round(secs));
}

/** Per-segment label, e.g. "~3 min" or "under a minute". */
export function formatSegment(secs: number): string {
  if (secs < 45) return "under a minute";
  return `~${Math.round(secs / 60)} min`;
}

/** Total label, always at least "1 min". */
export function formatTotal(secs: number): string {
  return `${Math.max(1, Math.round(secs / 60))} min`;
}
