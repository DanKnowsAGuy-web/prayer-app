/**
 * Septuagint (LXX) ↔ Masoretic (Hebrew) psalm numbering.
 *
 * Orthodox services number the Psalter by the Septuagint, which the bundled
 * Psalter text (World English Bible) does not use — the WEB follows the Hebrew
 * numbering. For most of the Psalter the LXX runs one behind the Hebrew, the
 * result of the two traditions joining and splitting psalms at different seams:
 *
 *   Hebrew 1–8     = LXX 1–8
 *   Hebrew 9–10    = LXX 9            (LXX joins them)
 *   Hebrew 11–113  = LXX 10–112       (LXX one behind)
 *   Hebrew 114–115 = LXX 113          (LXX joins them)
 *   Hebrew 116     = LXX 114–115      (LXX splits it)
 *   Hebrew 117–146 = LXX 116–145      (LXX one behind)
 *   Hebrew 147     = LXX 146–147      (LXX splits it)
 *   Hebrew 148–150 = LXX 148–150
 *
 * The set psalms of Matins and Vespers all fall in the simple one-behind ranges,
 * so converting an LXX number to its Hebrew counterpart for text lookup is exact.
 * The join/split seams (LXX 9, 113, 114, 115, 146, 147) are never used by those
 * services here; they are mapped to a representative Hebrew psalm so the lookup
 * still returns sound text if one is ever added.
 */
export function hebrewOf(lxx: number): number {
  if (lxx <= 8) return lxx;
  if (lxx === 9) return 9; // Hebrew 9–10 combined under LXX 9
  if (lxx <= 112) return lxx + 1; // 10–112 → 11–113
  if (lxx === 113) return 114; // Hebrew 114+115 combined under LXX 113
  if (lxx === 114 || lxx === 115) return 116; // Hebrew 116 split into LXX 114/115
  if (lxx <= 145) return lxx + 1; // 116–145 → 117–146
  if (lxx === 146 || lxx === 147) return 147; // Hebrew 147 split into LXX 146/147
  return lxx; // 148–150
}

/**
 * A psalm label in the app's Orthodox convention: the Septuagint number, with
 * the Hebrew (KJV/modern-Bible) number in parentheses when the two differ — so
 * the label matches the services and is still findable in a standard Bible.
 * An optional verse range is appended to the Septuagint number.
 */
export function lxxPsalmLabel(lxx: number, range?: { from: number; to: number }): string {
  const heb = hebrewOf(lxx);
  const verses = range ? `:${range.from}–${range.to}` : "";
  return heb === lxx
    ? `Psalm ${lxx}${verses}`
    : `Psalm ${lxx}${verses} (Heb. ${heb})`;
}
