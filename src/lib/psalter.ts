/**
 * The Psalter (World English Bible, public domain — see scripts/build-psalter.mjs)
 * as a simple sequential walk, advanced by count (advance-on-prayer).
 *
 * The whole Psalter is a flat sequence of UNITS. Each psalm is one unit, taken
 * whole — with one exception: Psalm 119 (the long acrostic of 22 stanzas) is
 * portioned into three-stanza blocks, each block counting as one unit, so it is
 * crossed over several sessions. A session takes N units from the current
 * pointer (default four), and praying advances the pointer by that many.
 */

export type PsalmSeg = { n: number; from?: number; to?: number };

type Verse = { v: number; text: string };
type PsalterBundle = { translation: string; psalms: Record<string, Verse[]> };

/** Psalm 119's 22 eight-verse stanzas, grouped three at a time (last is one). */
const PSALM_119_BLOCKS: [number, number][] = [
  [1, 24],
  [25, 48],
  [49, 72],
  [73, 96],
  [97, 120],
  [121, 144],
  [145, 168],
  [169, 176],
];

/** The flat unit sequence: Psalms 1–150, with 119 split into stanza blocks. */
function buildUnits(): PsalmSeg[] {
  const units: PsalmSeg[] = [];
  for (let n = 1; n <= 150; n++) {
    if (n === 119) {
      for (const [from, to] of PSALM_119_BLOCKS) units.push({ n: 119, from, to });
    } else {
      units.push({ n });
    }
  }
  return units;
}

export const PSALM_UNITS: PsalmSeg[] = buildUnits();
export const UNIT_COUNT = PSALM_UNITS.length; // 157

/** How many psalm units a session may take at most (the slider's top setting). */
export const MAX_PSALMS = 4;

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

/** The next `count` units from `index` (wrapping), each as its own movement. */
export function unitMovements(
  bundle: PsalterBundle,
  index: number,
  count: number,
): PsalmMovement[] {
  const out: PsalmMovement[] = [];
  for (let i = 0; i < count; i++) {
    const seg = PSALM_UNITS[(index + i) % UNIT_COUNT];
    out.push({ label: segLabel(seg), text: segText(bundle, seg) });
  }
  return out;
}

/** A short label for the unit at `index`, e.g. "Psalm 23" or "Psalm 119:1–24". */
export function unitLabel(index: number): string {
  return segLabel(PSALM_UNITS[index % UNIT_COUNT]);
}
