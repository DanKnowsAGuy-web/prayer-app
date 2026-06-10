import { initialState, type RuleState } from "./engine";

const KEY = "prayer-rule.v1";

export function loadState(): RuleState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<RuleState>;
    const base = initialState();
    // Merge over defaults so older/partial saves stay valid. Nested objects are
    // merged field-by-field so newly added keys (e.g. translation, the cycle)
    // auto-default instead of being clobbered by old shapes.
    return {
      ...base,
      ...parsed,
      cycle: { ...base.cycle, ...(parsed.cycle as object) },
      reminders: { ...base.reminders, ...(parsed.reminders as object) },
      father: { ...base.father, ...(parsed.father as object) },
    };
  } catch {
    return initialState();
  }
}

export function saveState(state: RuleState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable (private mode, quota) — fail quietly. */
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
