/**
 * Verification only (not feature code): pulls the estimator's real minute
 * numbers for the proposed value-spine levels, on real dates, so planning uses
 * the app's actual estimates rather than rough ranges.
 *
 *   node scripts/measure-levels.mjs
 */
import { readFileSync } from "node:fs";
import { THEMES } from "../src/lib/intercessoryCycle.ts";

const cal = JSON.parse(readFileSync(new URL("../src/data/calendarGospels.json", import.meta.url)));
const psalter = JSON.parse(readFileSync(new URL("../src/data/psalter.json", import.meta.url)));
const readings = JSON.parse(readFileSync(new URL("../src/data/readings.json", import.meta.url)));

// --- the app's estimator, replicated exactly (estimate.ts) ---
const WPM = 100, FLOOR = 90;
const words = (t) => (t.trim() ? t.trim().split(/\s+/).length : 0);
const segSecs = (text, contemplative = false) => {
  let s = (words(text) / WPM) * 60;
  if (contemplative) s = Math.max(s, FLOOR);
  return Math.max(12, Math.round(s));
};
const totalMin = (secsList) =>
  Math.max(1, Math.round(secsList.reduce((a, b) => a + b, 0) / 60));

// --- fixed segment texts (from the code) ---
const OPENING_LINE =
  "O Lord, open thou my lips.\nAnd my mouth shall show forth thy praise.\nO God, make speed to save me;\nO Lord, make haste to help me.";
const DOXOLOGY =
  "Glory be to the Father, and to the Son, and to the Holy Spirit; as it was in the beginning, is now, and ever shall be, world without end. Amen.";
const LORDS =
  "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done; on earth as it is in heaven. Give us this day our daily bread. And forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil. For thine is the kingdom, the power, and the glory, for ever and ever. Amen.";
const CLOSING =
  "O Lord, our heavenly Father, by whose providence the duties of men are appointed: grant me grace to do this day the work set before me, that I may not weary nor faint, but offer it all to thee. Amen.";
const EXAMEN = "Look back over the day. Where did you meet grace? Where did you fall short?";
const NIGHT_PSALM =
  "I will both lay me down in peace, and sleep: for thou, Lord, only makest me dwell in safety.";
const PRAYER_NIGHT =
  "Lighten my darkness, I beseech thee, O Lord; and by thy great mercy defend me from all perils and dangers of this night. Amen.";
const INTERCESSION_NAMES = "For my mother\nFor a friend in need\nFor peace in our home"; // 3 sample names
const INTERCESSION_BEFORE =
  "Lord, listen to the petition of our prayers, unworthy as we may be, and grant all good things profitable for our souls and salvation. For the servants of God we pray, Lord, have mercy:";
const INTERCESSION_AFTER =
  "Lord, as You will and as You know, have mercy on us and save us, for You are good and love mankind. Through the prayers of the holy fathers and holy mothers and all the saints who have gone before us, have mercy on us and save us. In the name of the Father, and the Son, and the Holy Spirit. Amen.";

// fixed seconds
const sOpening = segSecs(OPENING_LINE);
const sDox = segSecs(DOXOLOGY);
const sLords = segSecs(LORDS);
const sClosing = segSecs(CLOSING);
const sExamen = segSecs(EXAMEN, true); // contemplative floor
const sNightPsalm = segSecs(NIGHT_PSALM);
const sPrayerNight = segSecs(PRAYER_NIGHT);
const sIntercession = segSecs(`${INTERCESSION_BEFORE}\n${INTERCESSION_NAMES}\n${INTERCESSION_AFTER}`);

// --- variable segments from data ---
const gospelSecs = (mmdd, part = "morning") => segSecs(cal.days[mmdd][part].text);
const epistleSecs = (yyyymmdd) => {
  const d = readings.days[yyyymmdd];
  const ep = (d?.readings || []).find((r) => r.source === "Epistle");
  return ep ? segSecs(ep.text) : 0;
};
const psalterSecs = (portionIdx) => {
  // replicate portionMovements for a given portion (uses PSALM_PORTIONS order)
  // here we just measure a couple of representative portions by psalm numbers.
  return portionIdx;
};
// Psalter: measure a normal portion (Psalms 1-5) and a big one (Psalm 119:1-32)
const psalmText = (n, from, to) => {
  const verses = psalter.psalms[String(n)] || [];
  const chosen = from != null ? verses.filter((v) => v.v >= from && v.v <= to) : verses;
  return chosen.map((v) => v.text).join("\n");
};
const psalterNormal = [1, 2, 3, 4, 5].map((n) => segSecs(psalmText(n))).reduce((a, b) => a + b, 0);
const psalter119 = segSecs(psalmText(119, 1, 32));

// cycle: short and long entry
const allEntries = THEMES.flatMap((t) => t.pool);
const byLen = [...allEntries].sort((a, b) => words(a.prayer) - words(b.prayer));
const cycleShort = segSecs(byLen[0].prayer);
const cycleLong = segSecs(byLen[byLen.length - 1].prayer);

// pick a SHORT-gospel and LONG-gospel real date (morning ref)
const dayList = Object.entries(cal.days).map(([k, v]) => [k, words(v.morning.text)]);
dayList.sort((a, b) => a[1] - b[1]);
const shortDay = dayList[0][0];
const longDay = dayList[dayList.length - 1][0];

console.log("=== Source ===");
console.log("Gospel calendar: WEB, sequential one-passage-pair/day (user refs), NOT OCA.");
console.log("Epistle: orthocal.info OCA new-calendar, KJV (separate source, unpaired).\n");

console.log("=== Representative dates (morning Gospel) ===");
console.log(`short: ${shortDay} (${cal.days[shortDay].morning.ref})  long: ${longDay} (${cal.days[longDay].morning.ref})\n`);

console.log("=== Fixed segment seconds ===");
console.log({ sOpening, sDox, sLords, sClosing, sExamen, sNightPsalm, sPrayerNight, sIntercession });
console.log({ psalterNormal_Ps1to5: psalterNormal, psalter119_1to32: psalter119, cycleShort, cycleLong });
console.log({ gospelShort: gospelSecs(shortDay), gospelLong: gospelSecs(longDay), epistle_06_06: epistleSecs("2026-06-06") });

function morningLevels(mmdd) {
  const g = gospelSecs(mmdd, "morning");
  const ep = epistleSecs("2026-06-06"); // representative epistle
  const L1 = [sOpening, sLords, sClosing]; // floor: opening line + (address in opening) + Lord's Prayer + closing
  const L2 = [...L1, g];
  const L3 = [...L2, cycleShort];
  const L4 = [...L3, sIntercession];
  const L5 = [...L4, psalterNormal, sDox]; // Psalms + the doxology that answers them
  const L6 = [...L5, ep];
  return [L1, L2, L3, L4, L5, L6].map(totalMin);
}
function eveningLevels(mmdd, gospelCarried) {
  const g = gospelCarried ? 0 : gospelSecs(mmdd, "morning");
  const L1 = [sOpening, sLords, sExamen, sNightPsalm, sPrayerNight];
  const L2 = g ? [...L1, g] : [...L1];
  const L3 = [...L2, cycleShort];
  const L4 = [...L3, sIntercession];
  const L5 = [...L4, psalterNormal, sDox];
  return [L1, L2, L3, L4, L5].map(totalMin);
}

console.log("\n=== MORNING per-level totals (minutes) — short Gospel day ===");
console.log("L1..L6:", morningLevels(shortDay));
console.log("=== MORNING per-level totals — long Gospel day ===");
console.log("L1..L6:", morningLevels(longDay));
console.log("=== MORNING per-level — with the big Psalm 119 portion (L5/L6 swap psalter) ===");
{
  const g = gospelSecs(longDay);
  const ep = epistleSecs("2026-06-06");
  const base = [sOpening, sLords, sClosing, g, cycleLong, sIntercession];
  const L5 = totalMin([...base, psalter119, sDox]);
  const L6 = totalMin([...base, psalter119, sDox, ep]);
  console.log("L5 (119 day):", L5, "| L6 (119 day):", L6);
}

console.log("\n=== EVENING per-level totals — Gospel NOT done in morning (carried) ===");
console.log("L1..L5:", eveningLevels(shortDay, false));
console.log("=== EVENING per-level totals — Gospel already done in morning ===");
console.log("L1..L5:", eveningLevels(shortDay, true));
