import { initialState, type RuleState } from "./engine";

const KEY = "prayer-rule.v1";

export function loadState(): RuleState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<RuleState>;
    // Merge over defaults so older/partial saves stay valid.
    return { ...initialState(), ...parsed };
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
