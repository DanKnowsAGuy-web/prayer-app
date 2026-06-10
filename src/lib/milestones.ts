/**
 * Quiet firsts, noted once and mentioned gently on the home screen — never
 * badges or confetti, just faithfulness noticed in the app's own voice.
 */

export const MILESTONE_TEXT: Record<string, string> = {
  psalter:
    "You have prayed the whole Psalter — all one hundred fifty psalms, in course. Begun again.",
  "matins-psalms":
    "You have prayed all the psalms of Matins — the Six Psalms, the Polyeleos, and the Praises.",
  "gospel-Matthew":
    "You have read the Gospel of Matthew entire, through the Church's daily readings.",
  "gospel-Mark":
    "You have read the Gospel of Mark entire, through the Church's daily readings.",
  "gospel-Luke":
    "You have read the Gospel of Luke entire, through the Church's daily readings.",
  "gospel-John":
    "You have read the Gospel of John entire, through the Church's daily readings.",
  "gospels-all": "You have now read all four Gospels entire.",
  "matins-full":
    "For the first time, you prayed the morning rule whole — the full shape of Matins.",
};

/** Chapter counts for Gospel-coverage milestones. */
export const GOSPEL_CHAPTERS: Record<string, number> = {
  Matthew: 28,
  Mark: 16,
  Luke: 24,
  John: 21,
};

/**
 * The Gospel chapters a lectionary reference touches, e.g.
 * "Matthew 10.32-33, 37-38, 19.27-30" → { book: "Matthew", chapters: [10, 19] }.
 * Chapter numbers are every number that precedes a "." in the reference.
 */
export function gospelRefChapters(
  ref: string,
): { book: string; chapters: number[] } | null {
  const m = ref.trim().match(/^([A-Za-z]+)\s/);
  if (!m || !(m[1] in GOSPEL_CHAPTERS)) return null;
  const chapters = [...ref.matchAll(/(\d+)\./g)].map((x) => Number(x[1]));
  // Cross-chapter ranges like "4.25-5.12" name both chapters; fill any span.
  const spans = [...ref.matchAll(/(\d+)\.\d+\s*-\s*(\d+)\.\d+/g)];
  for (const [, a, b] of spans) {
    for (let c = Number(a); c <= Number(b); c++) chapters.push(c);
  }
  return { book: m[1], chapters: [...new Set(chapters)].sort((a, b) => a - b) };
}
