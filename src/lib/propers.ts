/**
 * The bundled daily propers for the EO morning rule: the saint of the day's
 * troparion and kontakion (OCA's translations) and the tone of the week
 * (orthocal). Generated at build time by scripts/build-propers.mjs; nothing is
 * fetched at runtime. Days OCA could not supply carry `gap: true`, which the
 * UI surfaces as a visible flag rather than inventing content.
 */

export type Hymn = { tone: number; text: string };

export type ProperDay = {
  tone?: number | null;
  /** Days from Pascha (negative = before), for the season accents. */
  pd?: number | null;
  /** The day's fasting discipline, from orthocal. */
  fast?: { level: number; desc: string; exception: string };
  /** The day's feast rank and names, from orthocal. */
  feast?: { level: number; names: string[] };
  saint?: string;
  troparion?: Hymn;
  kontakion?: Hymn;
  gap?: boolean;
};

/** A saint's life, served beside the day's prayers. */
export type SaintLife = { t: string; s: string };

let livesCache: { days: Record<string, SaintLife[]> } | null = null;

/** Load (and cache) the bundled lives of the saints (lazy; it is large). */
export async function loadSaintLives(): Promise<{ days: Record<string, SaintLife[]> }> {
  if (!livesCache) {
    const mod = await import("../data/saintLives.json");
    livesCache = (mod.default ?? mod) as unknown as { days: Record<string, SaintLife[]> };
  }
  return livesCache;
}

type Propers = {
  source: string;
  start: string;
  end: string;
  days: Record<string, ProperDay>;
};

let cache: Propers | null = null;

/** Load (and cache) the bundled propers. */
export async function loadPropers(): Promise<Propers> {
  if (!cache) {
    const mod = await import("../data/propers.json");
    cache = (mod.default ?? mod) as unknown as Propers;
  }
  return cache;
}

export function propersFor(propers: Propers, date: string): ProperDay | undefined {
  return propers.days[date];
}
