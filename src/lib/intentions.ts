/**
 * The prayer list's categories: each supplies the line woven into the office
 * for a held name, and a label for the manager. The text the user typed is the
 * NAME; the category surrounds it with the Church's words for the reason.
 *
 * Wording follows the app's quiet, traditional voice. "general" is the plain
 * fallback — a name with no reason attached, prayed simply "for N."
 */
import { categoryOf, type Intention, type IntentionCategory } from "./engine";

export type CategoryDef = {
  key: IntentionCategory;
  /** Shown in the manager when choosing or moving a name. */
  label: string;
  /** A short hint of when it fits, shown beneath the label. */
  hint: string;
  /** The line prayed in the office, given the name and any context word. */
  line: (name: string, context?: string) => string;
};

/** `, my grandmother` etc., or "" when no context word was given. */
function ctx(context?: string): string {
  const c = context?.trim();
  return c ? `, ${c}` : "";
}

/**
 * Categories in the order they are offered and grouped — the living first,
 * the departed last, as the commemorations are ordered in the services.
 */
export const CATEGORIES: CategoryDef[] = [
  {
    key: "sick",
    label: "The sick",
    hint: "illness, surgery, recovery",
    line: (n, c) => `for the health and salvation of ${n}${ctx(c)}`,
  },
  {
    key: "afflicted",
    label: "The afflicted",
    hint: "sorrow, hardship, those in despair",
    line: (n, c) => `for ${n}${ctx(c)}, in their affliction`,
  },
  {
    key: "strayed",
    label: "Those who have strayed",
    hint: "those fallen away from the faith",
    line: (n, c) => `for ${n}${ctx(c)}, that they may find their way home`,
  },
  {
    key: "peace",
    label: "Peace with those at odds",
    hint: "the estranged, those who wrong us",
    line: (n, c) => `for ${n}${ctx(c)}, and for peace between us`,
  },
  {
    key: "new-life",
    label: "New life",
    hint: "the expectant, the newly baptized or married",
    line: (n, c) => `for ${n}${ctx(c)}, in this new beginning`,
  },
  {
    key: "asked",
    label: "Those who asked our prayers",
    hint: "those who entrusted themselves to you",
    line: (n, c) => `for ${n}${ctx(c)}, who asked our prayers`,
  },
  {
    key: "general",
    label: "General",
    hint: "a name held simply before God",
    line: (n, c) => `for ${n}${ctx(c)}`,
  },
  {
    key: "departed",
    label: "The departed",
    hint: "those who have fallen asleep",
    line: (n, c) => `for the repose of ${n}${ctx(c)}; may their memory be eternal`,
  },
];

const BY_KEY: Record<IntentionCategory, CategoryDef> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
) as Record<IntentionCategory, CategoryDef>;

export function categoryDef(key: IntentionCategory): CategoryDef {
  return BY_KEY[key] ?? BY_KEY.general;
}

export function categoryLabel(key: IntentionCategory): string {
  return categoryDef(key).label;
}

/** The line prayed in the office for one held name. */
export function intentionLine(i: Intention): string {
  return categoryDef(categoryOf(i)).line(i.text, i.context);
}

/**
 * The day's names as woven lines, ordered by category (living first, departed
 * last) so the commemorations read as the services order them. Order within a
 * category follows the list as given.
 */
export function intentionLines(intentions: Intention[]): string[] {
  const order = CATEGORIES.map((c) => c.key);
  return [...intentions]
    .sort((a, b) => order.indexOf(categoryOf(a)) - order.indexOf(categoryOf(b)))
    .map(intentionLine);
}
