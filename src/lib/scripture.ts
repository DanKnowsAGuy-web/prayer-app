/**
 * Offline scripture: resolves a lectionary reference (orthocal "display" form,
 * e.g. "Hebrews 11.33-12.2" or "Matthew 10.32-33, 37-38, 19.27-30") to verse
 * text, drawn from a local New Testament store in the chosen translation.
 *
 * The lectionary plan (which passages) is fixed in lectionary.json; only the
 * verse text changes with the translation preference. Nothing is fetched at
 * runtime — the NT stores ship in the bundle.
 */

export type Translation = "web" | "kjv" | "msb";

/** Verse store: books → chapter number → verse number → text. */
export type NTStore = {
  translation: string;
  code: Translation;
  books: Record<string, Record<string, Record<string, string>>>;
};

type Segment = { fromCh: number; fromV: number; toCh: number; toV: number };
type Clause = { book: string; segments: Segment[] };

/** Split a chapter-verse token on either "." or ":" (orthocal uses both). */
function splitCV(token: string): [number, number] {
  const [c, v] = token.split(/[.:]/);
  return [Number(c), Number(v)];
}

/**
 * Match an abbreviated or full book name (e.g. "Matt", "John") to a canonical
 * store key. Single-chapter books are referenced verse-only ("Jude 1-10").
 */
function canonicalBook(store: NTStore, raw: string): string | null {
  const token = raw.replace(/\.$/, "").trim().toLowerCase();
  const keys = Object.keys(store.books);
  const exact = keys.find((k) => k.toLowerCase() === token);
  if (exact) return exact;
  // Prefix match, respecting any leading ordinal (1/2/3 John, etc.).
  const pref = keys.find((k) => k.toLowerCase().startsWith(token));
  return pref ?? null;
}

/** Parse one book-clause ("Book c.v-c.v, v-v") into a book and verse segments. */
function parseClause(store: NTStore, clause: string): Clause | null {
  const m = clause.trim().match(/^([1-3]?\s?[A-Za-z]+\.?)\s+(.+)$/);
  if (!m) return null;
  const book = canonicalBook(store, m[1]);
  if (!book) return null;
  const parts = m[2].split(",").map((s) => s.trim()).filter(Boolean);
  const segments: Segment[] = [];
  // Single-chapter books cite verses with no chapter, so chapter defaults to 1.
  let curCh = 1;

  for (const part of parts) {
    const hasCV = (s: string) => /[.:]/.test(s);
    if (part.includes("-")) {
      const [aRaw, bRaw] = part.split("-").map((s) => s.trim());
      const [fromCh, fromV] = hasCV(aRaw) ? splitCV(aRaw) : [curCh, Number(aRaw)];
      const [toCh, toV] = hasCV(bRaw) ? splitCV(bRaw) : [fromCh, Number(bRaw)];
      segments.push({ fromCh, fromV, toCh, toV });
      curCh = toCh;
    } else {
      const [ch, v] = hasCV(part) ? splitCV(part) : [curCh, Number(part)];
      segments.push({ fromCh: ch, fromV: v, toCh: ch, toV: v });
      curCh = ch;
    }
  }
  if (segments.some((s) => [s.fromCh, s.fromV, s.toCh, s.toV].some(Number.isNaN)))
    return null;
  return { book, segments };
}

/** Parse a (possibly multi-book, ";"-separated) reference into clauses. */
export function parseRef(store: NTStore, ref: string): Clause[] {
  return ref
    .split(";")
    .map((c) => parseClause(store, c))
    .filter((c): c is Clause => c !== null);
}

/** The highest verse number present in a chapter (for "to end of chapter"). */
function maxVerse(chapter: Record<string, string>): number {
  return Object.keys(chapter).reduce((n, k) => Math.max(n, Number(k)), 0);
}

/** Resolve a reference to its verse texts, in order. Returns [] if unresolved. */
export function resolveVerses(store: NTStore, ref: string): string[] {
  const out: string[] = [];
  for (const clause of parseRef(store, ref)) {
    const book = store.books[clause.book];
    if (!book) continue;
    for (const seg of clause.segments) {
      for (let ch = seg.fromCh; ch <= seg.toCh; ch++) {
        const chapter = book[String(ch)];
        if (!chapter) continue;
        const start = ch === seg.fromCh ? seg.fromV : 1;
        const end = ch === seg.toCh ? seg.toV : maxVerse(chapter);
        for (let v = start; v <= end; v++) {
          const text = chapter[String(v)];
          if (text) out.push(text);
        }
      }
    }
  }
  return out;
}

/** Resolve a reference to a single readable passage (verses joined). */
export function passageFor(store: NTStore, ref: string): string {
  return resolveVerses(store, ref).join(" ");
}

const stores: Partial<Record<Translation, NTStore>> = {};

/** Load (and cache) an NT store for a translation. Bundled, never fetched. */
export async function loadScripture(translation: Translation): Promise<NTStore> {
  if (stores[translation]) return stores[translation]!;
  const mod =
    translation === "kjv"
      ? await import("../data/nt-kjv.json")
      : translation === "msb"
        ? await import("../data/nt-msb.json")
        : await import("../data/nt-web.json");
  const store = (mod.default ?? mod) as unknown as NTStore;
  stores[translation] = store;
  return store;
}

export type LectionaryDay = { gospel?: string; epistle?: string };
type Lectionary = { start: string; end: string; days: Record<string, LectionaryDay> };

let lectionary: Lectionary | null = null;

/** Load (and cache) the date → {gospel, epistle} reference plan. */
export async function loadLectionary(): Promise<Lectionary> {
  if (!lectionary) {
    const mod = await import("../data/lectionary.json");
    lectionary = (mod.default ?? mod) as unknown as Lectionary;
  }
  return lectionary;
}

export function lectionaryFor(lect: Lectionary, date: string): LectionaryDay | undefined {
  return lect.days[date];
}
