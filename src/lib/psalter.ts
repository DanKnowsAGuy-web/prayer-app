/**
 * The Psalter (World English Bible, public domain — see scripts/build-psalter.mjs)
 * and the 30-day division scheme, flattened into 60 ordered portions.
 *
 * The division follows the traditional 1662 Book of Common Prayer Psalter (we
 * borrow only the *scheme*, not its text). Read one portion per prayer, in
 * order, and the whole Psalter is covered in 60 prayers, then it loops.
 */

export type PsalmSeg = { n: number; from?: number; to?: number };
export const PORTION_COUNT = 60;

type Verse = { v: number; text: string };
type PsalterBundle = { translation: string; psalms: Record<string, Verse[]> };

const R = (a: number, b: number): PsalmSeg[] => {
  const s: PsalmSeg[] = [];
  for (let n = a; n <= b; n++) s.push({ n });
  return s;
};

/** 60 portions: Day 1 morning, Day 1 evening, Day 2 morning, … Day 30 evening. */
export const PSALM_PORTIONS: PsalmSeg[][] = [
  R(1, 5), R(6, 8),
  R(9, 11), R(12, 14),
  R(15, 17), [{ n: 18 }],
  R(19, 21), R(22, 23),
  R(24, 26), R(27, 29),
  R(30, 31), R(32, 34),
  R(35, 36), [{ n: 37 }],
  R(38, 40), R(41, 43),
  R(44, 46), R(47, 49),
  R(50, 52), R(53, 55),
  R(56, 58), R(59, 61),
  R(62, 64), R(65, 67),
  [{ n: 68 }], R(69, 70),
  R(71, 72), R(73, 74),
  R(75, 77), [{ n: 78 }],
  R(79, 81), R(82, 85),
  R(86, 88), [{ n: 89 }],
  R(90, 92), R(93, 94),
  R(95, 97), R(98, 101),
  R(102, 103), [{ n: 104 }],
  [{ n: 105 }], [{ n: 106 }],
  [{ n: 107 }], R(108, 109),
  R(110, 113), R(114, 115),
  R(116, 118), [{ n: 119, from: 1, to: 32 }],
  [{ n: 119, from: 33, to: 72 }], [{ n: 119, from: 73, to: 104 }],
  [{ n: 119, from: 105, to: 144 }], [{ n: 119, from: 145, to: 176 }],
  R(120, 125), R(126, 131),
  R(132, 135), R(136, 138),
  R(139, 140), R(141, 143),
  R(144, 146), R(147, 150),
];

let cache: PsalterBundle | null = null;
export async function loadPsalter(): Promise<PsalterBundle> {
  if (!cache) {
    const mod = await import("../data/psalter.json");
    cache = (mod.default ?? mod) as unknown as PsalterBundle;
  }
  return cache;
}

const EN_DASH = "–";

export function segLabel(seg: PsalmSeg): string {
  if (seg.from != null && seg.to != null) {
    return `Psalm ${seg.n}:${seg.from}${EN_DASH}${seg.to}`;
  }
  return `Psalm ${seg.n}`;
}

function segText(bundle: PsalterBundle, seg: PsalmSeg): string {
  const verses = bundle.psalms[String(seg.n)] || [];
  const chosen =
    seg.from != null && seg.to != null
      ? verses.filter((v) => v.v >= seg.from! && v.v <= seg.to!)
      : verses;
  return chosen.map((v) => v.text).join("\n");
}

export type PsalmMovement = { label: string; text: string };

/** Each psalm (or verse-range) in the current portion as its own movement. */
export function portionMovements(
  bundle: PsalterBundle,
  index: number,
): PsalmMovement[] {
  const portion = PSALM_PORTIONS[index % PORTION_COUNT];
  return portion.map((seg) => ({ label: segLabel(seg), text: segText(bundle, seg) }));
}

/** A short label for the whole portion, e.g. "Psalms 1–5" or "Psalm 119:1–32". */
export function portionLabel(index: number): string {
  const portion = PSALM_PORTIONS[index % PORTION_COUNT];
  if (portion.length === 1) return segLabel(portion[0]);
  const first = portion[0].n;
  const last = portion[portion.length - 1].n;
  return `Psalms ${first}${EN_DASH}${last}`;
}
