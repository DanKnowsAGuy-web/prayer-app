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
  saint?: string;
  troparion?: Hymn;
  kontakion?: Hymn;
  gap?: boolean;
};

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
