/**
 * The prayer list's petitions. Each category opens with a short litany bid —
 * a line or two in the Church's voice — after which the names held under it are
 * simply read. So the office prays the petition first, then the names, rather
 * than folding each name into its own sentence.
 *
 * Wording follows the app's quiet, traditional voice. "general" is the plain
 * petition — names carried without a stated reason — and comes first.
 */
import {
  effectiveCategory,
  intentionsForDate,
  type Intention,
  type IntentionCategory,
} from "./engine";

export type CategoryDef = {
  key: IntentionCategory;
  /** Shown in the manager when choosing or moving a name. */
  label: string;
  /** A short hint of when it fits, shown beneath the label. */
  hint: string;
  /** The litany bid prayed before the names of this petition. */
  bid: string;
  /** A note on when the petition is prayed, when it isn't simply daily/weekly. */
  schedule?: string;
};

/**
 * The petitions, in the order they are offered and prayed — the general
 * remembrance first, the departed last, as a litany moves toward the close.
 * "afflicted" is intentionally absent: it is merged into "sick" (see
 * categoryOf), and legacy names resolve there.
 */
export const CATEGORIES: CategoryDef[] = [
  {
    key: "general",
    label: "General",
    hint: "a name carried simply before God",
    bid: "For all those we carry in our hearts and name before You, O Lord:",
  },
  {
    key: "sick",
    label: "The sick & afflicted",
    hint: "illness, suffering, sorrow, those in despair",
    bid: "For the sick and the suffering, that the Lord may visit them with His healing and peace, and lighten every affliction:",
  },
  {
    key: "strayed",
    label: "Those who have strayed",
    hint: "those fallen away from the faith",
    bid: "For those who have wandered from the way, that the Good Shepherd may seek them and bring them home:",
  },
  {
    key: "peace",
    label: "Peace with those at odds",
    hint: "the estranged, those who wrong us",
    bid: "For those from whom we are estranged, and for peace and reconciliation between us:",
  },
  {
    key: "new-life",
    label: "New life",
    hint: "the expectant, the newly baptized or married",
    bid: "For those at the threshold of new life, that You bless and keep them in their beginning:",
    schedule: "Prayed each day for forty days, then kept in the general remembrance.",
  },
  {
    key: "asked",
    label: "Those who asked our prayers",
    hint: "those who entrusted themselves to you",
    bid: "For all who have asked our prayers, and those we have promised to remember:",
  },
  {
    key: "departed",
    label: "The departed",
    hint: "those who have fallen asleep",
    bid: "For Your servants who have fallen asleep before us, that You give them rest where Your light shines, and make their memory eternal:",
    schedule: "Prayed on Fridays, the day of the Cross.",
  },
];

const BY_KEY: Record<IntentionCategory, CategoryDef> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
) as Record<IntentionCategory, CategoryDef>;

/** The petition for a category, resolving merged/legacy keys to a real one. */
export function categoryDef(key: IntentionCategory): CategoryDef {
  return BY_KEY[key] ?? BY_KEY.general;
}

export function categoryLabel(key: IntentionCategory): string {
  return categoryDef(key).label;
}

export type IntercessionBlock = {
  key: IntentionCategory;
  label: string;
  bid: string;
  /** The names held under this petition, in the order they were added. */
  names: string[];
};

/**
 * The day's names grouped into petitions, in canonical order — each block its
 * litany bid and the names read under it. Empty petitions are omitted.
 */
export function intercessionBlocks(
  intentions: Intention[],
  date: string,
): IntercessionBlock[] {
  const today = intentionsForDate(intentions, date);
  return CATEGORIES.map((def) => ({
    key: def.key,
    label: def.label,
    bid: def.bid,
    names: today
      .filter((i) => effectiveCategory(i, date) === def.key)
      .map((i) => i.text),
  })).filter((b) => b.names.length > 0);
}

/**
 * The prayer-list body for the office: each petition's bid, then its names on
 * the following line. Blocks are separated by a blank line. "" when no names
 * come up today (the caller supplies its own empty-state line).
 */
export function intercessionBody(intentions: Intention[], date: string): string {
  return intercessionBlocks(intentions, date)
    .map((b) => `${b.bid}\n${b.names.join(", ")}.`)
    .join("\n\n");
}
