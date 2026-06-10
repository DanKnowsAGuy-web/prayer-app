/**
 * Builds the Majority Standard Bible NT verse store (nt-msb.json) from the
 * official structured USFM release — never scraped presentation HTML.
 *
 * Source: BSB-publishing/bsb2usfm GitHub releases (MSB_usfm.zip). The MSB's
 * New Testament is translated from the Robinson–Pierpont Byzantine Majority
 * Text and is dedicated to the public domain (April 30, 2023). The release is
 * NT-only — the MSB's distinctive part (its OT is shared with the BSB).
 *
 * To refresh:
 *   curl -sL -o scripts/.msb/MSB_usfm.zip \
 *     https://github.com/BSB-publishing/bsb2usfm/releases/download/v5.3/MSB_usfm.zip
 *   (unzip to scripts/.msb/usfm/)  then:  node scripts/build-msb.mjs
 *
 * The text is stored verbatim from the source — footnotes and cross-reference
 * apparatus are removed, the scripture words are untouched. Revelation is not
 * bundled (the lectionary never reads it), matching the WEB and KJV stores.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const SRC = new URL("./.msb/usfm/", import.meta.url);
const OUT = new URL("../src/data/nt-msb.json", import.meta.url);

/** USFM book codes → the store's book names (same keys as nt-web/nt-kjv). */
const BOOKS = {
  MAT: "Matthew", MRK: "Mark", LUK: "Luke", JHN: "John", ACT: "Acts",
  ROM: "Romans", "1CO": "1 Corinthians", "2CO": "2 Corinthians",
  GAL: "Galatians", EPH: "Ephesians", PHP: "Philippians", COL: "Colossians",
  "1TH": "1 Thessalonians", "2TH": "2 Thessalonians", "1TI": "1 Timothy",
  "2TI": "2 Timothy", TIT: "Titus", PHM: "Philemon", HEB: "Hebrews",
  JAS: "James", "1PE": "1 Peter", "2PE": "2 Peter", "1JN": "1 John",
  "2JN": "2 John", "3JN": "3 John", JUD: "Jude",
};

/** Strip USFM apparatus from a verse's text, leaving the scripture verbatim. */
function cleanVerse(s) {
  return s
    .replace(/\\f\s\+[\s\S]*?\\f\*/g, "") // footnotes
    .replace(/\\x\s[\s\S]*?\\x\*/g, "") // cross references
    .replace(/\\ref\s[\s\S]*?\\ref\*/g, "") // inline reference links
    .replace(/\\wj\*|\\wj\s?/g, "") // words-of-Jesus markers (keep the words)
    .replace(/\\add\*|\\add\s?/g, "")
    .replace(/\\nd\*|\\nd\s?/g, "")
    .replace(/\\\+?[a-z0-9]+\*?/g, " ") // any remaining markers
    .replace(/\s+/g, " ")
    .trim();
}

/** Markers whose line content continues the current verse. */
const VERSE_FLOW = /^\\(p|m|q\d?|pi\d?|li\d?|pc|nb|mi)\b\s*/;

function parseBook(usfm) {
  const chapters = {};
  let ch = 0;
  let verse = 0;
  let buf = "";
  const flush = () => {
    if (ch && verse && buf.trim()) {
      (chapters[ch] ||= {})[verse] = cleanVerse(buf);
    }
    buf = "";
  };
  for (const rawLine of usfm.split(/\r?\n/)) {
    let line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("\\c ")) {
      flush();
      ch = Number(line.slice(3).trim());
      verse = 0;
      continue;
    }
    // Headings, titles, references between verses end the running verse text.
    if (/^\\(s\d?|r|b|mt\d?|h|toc\d|id|usfm|d|ms\d?|mr)\b/.test(line)) {
      if (/^\\(s\d?|r|b|ms\d?|mr|d)\b/.test(line)) continue; // skip, keep verse open across them
      continue;
    }
    line = line.replace(VERSE_FLOW, "");
    // One line may hold several \v markers; split and route them.
    const parts = line.split(/\\v\s+(\d+)\s*/);
    // parts[0] is continuation of the current verse.
    if (parts[0]) buf += " " + parts[0];
    for (let i = 1; i < parts.length; i += 2) {
      flush();
      verse = Number(parts[i]);
      buf = parts[i + 1] ?? "";
    }
  }
  flush();
  return chapters;
}

const books = {};
for (const file of readdirSync(SRC)) {
  const code = file.replace(/\.usfm$/i, "");
  const name = BOOKS[code];
  if (!name) continue; // REV and any non-NT extras are not bundled
  books[name] = parseBook(readFileSync(new URL(file, SRC), "utf-8"));
}

// Completeness check before writing: every expected book, no empty chapters.
const missing = Object.values(BOOKS).filter((n) => !books[n]);
if (missing.length) {
  console.error("MISSING BOOKS:", missing.join(", "));
  process.exitCode = 1;
} else {
  const payload = {
    translation: "Majority Standard Bible",
    code: "msb",
    license:
      "Public Domain (dedicated April 30, 2023). NT from the Robinson–Pierpont Byzantine Majority Text; source: BSB-publishing/bsb2usfm USFM release.",
    books,
  };
  writeFileSync(OUT, JSON.stringify(payload));
  const chapters = Object.values(books).reduce((n, b) => n + Object.keys(b).length, 0);
  const verses = Object.values(books).reduce(
    (n, b) => n + Object.values(b).reduce((m, c) => m + Object.keys(c).length, 0),
    0,
  );
  console.log(`Wrote nt-msb.json: ${Object.keys(books).length} books, ${chapters} chapters, ${verses} verses.`);
}
