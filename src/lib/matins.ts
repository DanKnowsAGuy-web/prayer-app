/**
 * The fixed material of the EO morning (Matins-shaped) rule: the spine texts
 * that never change, the fixed day-of-week theme troparia, and the rotating
 * "featured fragment" that tours the structure of Orthros one window per day.
 *
 * Everything here is bundled, vetted, and traditional/public domain — never
 * fetched. The date-specific propers (the saint's troparion and kontakion)
 * come from src/data/propers.json instead (see scripts/build-propers.mjs).
 */
import type { Movement } from "./resolve";

// ── The fixed spine ──────────────────────────────────────────────────────────

export const TRISAGION: Omit<Movement, "kind" | "level"> = {
  label: "Trisagion prayers",
  text: "Holy God, Holy Mighty, Holy Immortal, have mercy on us. (three times)\n\nGlory to the Father, and to the Son, and to the Holy Spirit, now and ever, and unto ages of ages. Amen.\n\nO Most Holy Trinity, have mercy on us. O Lord, cleanse us from our sins. O Master, pardon our transgressions. O Holy One, visit and heal our infirmities, for Thy Name's sake.\n\nLord, have mercy. (three times)\n\nGlory to the Father, and to the Son, and to the Holy Spirit, now and ever, and unto ages of ages. Amen.",
};

export const GREAT_DOXOLOGY: Omit<Movement, "kind" | "level"> = {
  label: "The Great Doxology",
  ref: "Sung at the close of festal Matins",
  text: "Glory to God in the highest, and on earth peace, good will among men.\n\nWe praise Thee, we bless Thee, we worship Thee, we glorify Thee, we give thanks to Thee for Thy great glory.\n\nO Lord, Heavenly King, God the Father Almighty; O Lord, the only-begotten Son, Jesus Christ; and O Holy Spirit.\n\nO Lord God, Lamb of God, Son of the Father, who takest away the sin of the world: have mercy on us; Thou who takest away the sins of the world, receive our prayer; Thou who sittest at the right hand of the Father, have mercy on us.\n\nFor Thou alone art holy; Thou alone art the Lord, Jesus Christ, to the glory of God the Father. Amen.\n\nEvery day will I bless Thee, and I will praise Thy Name forever and ever.\n\nVouchsafe, O Lord, to keep us this day without sin. Blessed art Thou, O Lord, the God of our fathers, and praised and glorified is Thy Name forever. Amen.\n\nLet Thy mercy, O Lord, be upon us, as we have set our hope on Thee. Blessed art Thou, O Lord, teach me Thy statutes. (three times)\n\nLord, Thou hast been our refuge from generation to generation. I said: O Lord, have mercy on me; heal my soul, for I have sinned against Thee.\n\nO Lord, to Thee have I fled; teach me to do Thy will, for Thou art my God. For with Thee is the fountain of life, and in Thy light shall we see light. Continue Thy mercy to those who know Thee.",
};

export const DISMISSAL: Omit<Movement, "kind" | "level"> = {
  label: "Dismissal",
  text: "Through the prayers of our holy fathers, O Lord Jesus Christ our God, have mercy on us and save us. Amen.",
};

// ── Day-of-week themes (fixed troparia; never change, so never fetched) ──────

type WeekdayTheme = { name: string; text: string };

/** Indexed by weekday, 0 = Sunday … 6 = Saturday. Wednesday and Friday share the Cross. */
const WEEKDAY_THEMES: WeekdayTheme[] = [
  {
    name: "The Resurrection",
    text: "Having beheld the Resurrection of Christ, let us worship the holy Lord Jesus, the only Sinless One. We venerate Thy Cross, O Christ, and we hymn and glorify Thy holy Resurrection; for Thou art our God, and we know no other than Thee; we call on Thy name. Come, all you faithful, let us venerate Christ's holy Resurrection, for behold, through the Cross joy has come into all the world. Ever blessing the Lord, let us praise His Resurrection, for by enduring the Cross for us, He has destroyed death by death.",
  },
  {
    name: "The Bodiless Powers of Heaven",
    text: "Commanders of the heavenly hosts, we who are unworthy beseech you: by your prayers encompass us beneath the wings of your immaterial glory, and faithfully preserve us who fall down and cry to you: deliver us from all harm, for you are the commanders of the powers on high.",
  },
  {
    name: "The Holy Forerunner",
    text: "The memory of the just is celebrated with hymns of praise, but the Lord's testimony is sufficient for thee, O Forerunner; for thou hast proved to be truly even more venerable than the prophets, since thou wast granted to baptize in the running waters Him whom they proclaimed. Wherefore, having contested for the truth, thou didst rejoice to announce the good tidings even to those in hades: that God hath appeared in the flesh, taking away the sin of the world and granting us great mercy.",
  },
  {
    name: "The Precious Cross",
    text: "O Lord, save Thy people, and bless Thine inheritance. Grant victories to the Orthodox Christians over their adversaries; and by virtue of Thy Cross, preserve Thy habitation.",
  },
  {
    name: "The Holy Apostles",
    text: "O holy Apostles, intercede with the merciful God, that He may grant our souls forgiveness of sins.",
  },
  {
    name: "The Precious Cross",
    text: "O Lord, save Thy people, and bless Thine inheritance. Grant victories to the Orthodox Christians over their adversaries; and by virtue of Thy Cross, preserve Thy habitation.",
  },
  {
    name: "All Saints and the Departed",
    text: "O Apostles, Martyrs, and Prophets, holy Hierarchs, Saints, and Righteous Ones, who have fought the good fight and kept the faith: since you have boldness before the Savior, intercede for us with Him, for He is good, that He may save our souls.\n\nRemember, O Lord, as Thou art good, Thy servants who have fallen asleep, and forgive all their sins in this life; for no one is sinless but Thee, who art able to give rest to the departed.",
  },
];

/** The fixed theme for a weekday (0=Sun…6=Sat), with the Sunday tone shown. */
export function weekdayTheme(weekday: number, tone?: number | null): Omit<Movement, "kind" | "level"> {
  const t = WEEKDAY_THEMES[weekday] ?? WEEKDAY_THEMES[0];
  const toneLabel = weekday === 0 && tone ? ` · Tone ${tone}` : "";
  return {
    label: "The day's remembrance",
    ref: `${t.name}${toneLabel}`,
    text: t.text,
  };
}

// ── The Psalms of Matins (the first psalm slot's fixed loop) ───────────────────
//
// Not the Psalter walk: an eleven-psalm loop through the psalms that belong to
// Matins itself — the Six Psalms, the Polyeleos, and the Praises — one per
// session, advancing by usage on its own pointer.

type PsalterBundle = { psalms: Record<string, { v: number; text: string }[]> };

function psalmText(bundle: PsalterBundle, n: number): string {
  return (bundle.psalms[String(n)] || []).map((v) => v.text).join("\n");
}

const MATINS_PSALM_LOOP: { n: number; place: string }[] = [
  { n: 3, place: "from the Six Psalms, the quiet opening of Matins" },
  { n: 38, place: "from the Six Psalms, the quiet opening of Matins" },
  { n: 63, place: "from the Six Psalms, the quiet opening of Matins" },
  { n: 88, place: "from the Six Psalms, the quiet opening of Matins" },
  { n: 103, place: "from the Six Psalms, the quiet opening of Matins" },
  { n: 143, place: "from the Six Psalms, the quiet opening of Matins" },
  { n: 135, place: "from the Polyeleos, the festal psalms of praise" },
  { n: 136, place: "from the Polyeleos, the festal psalms of praise" },
  { n: 148, place: "from the Praises (Lauds), near the end of Matins" },
  { n: 149, place: "from the Praises (Lauds), near the end of Matins" },
  { n: 150, place: "from the Praises (Lauds), near the end of Matins" },
];

export const MATINS_PSALM_COUNT = MATINS_PSALM_LOOP.length; // 11

/** The Matins psalm at a rotation index (wrapping). */
export function serveMatinsPsalm(
  bundle: PsalterBundle,
  index: number,
): Omit<Movement, "kind" | "level"> {
  const i = ((index % MATINS_PSALM_COUNT) + MATINS_PSALM_COUNT) % MATINS_PSALM_COUNT;
  const { n, place } = MATINS_PSALM_LOOP[i];
  return {
    label: `Psalm ${n}`,
    ref: `A psalm of Matins — ${place}`,
    text: psalmText(bundle, n),
  };
}

// ── The featured fragment rotation (the familiarity engine) ──────────────────────
//
// Two stops, alternating: the grouped troparia moment ("God is the Lord", the
// day's exapostilarion, and the Song of the Theotokos), and the biblical
// canticles of the Canon, toured one ode per visit.

/** The daily exapostilaria (the hymn of light), fixed per weekday, 0=Sun…6=Sat. */
const WEEKDAY_EXAPOSTILARIA: string[] = [
  "Holy is the Lord our God.\nHoly is the Lord our God.\nExalt the Lord our God, and worship at the footstool of His feet, for He is holy.",
  "As Thou didst adorn the heaven with stars, O God, and dost enlighten all the earth through Thine angels: O Creator of all, save them that hymn Thee.",
  "Let us all praise the Forerunner and Baptist of the Savior, the prophet among prophets and nurtured in the wilderness: by his intercessions, O Lord, save our souls.",
  "The Cross is the guardian of the whole world; the Cross is the beauty of the Church; the Cross is the might of kings; the Cross is the confirmation of the faithful; the Cross is the glory of angels and the wounding of demons.",
  "O Word, Wisdom of the Father most high: visit us through Thine all-praised Apostles, and grant us Thy mercy.",
  "The Cross is the guardian of the whole world; the Cross is the beauty of the Church; the Cross is the might of kings; the Cross is the confirmation of the faithful; the Cross is the glory of angels and the wounding of demons.",
  "Thou who as God hast authority over the living and the dead: give rest with Thy saints to the souls of Thy servants; for Thou alone art the Lover of mankind.",
];

const GOD_IS_THE_LORD =
  "God is the Lord, and has revealed Himself to us. Blessed is He who comes in the name of the Lord.\n\nO give thanks to the Lord, for He is good; for His loving kindness endures forever.";

const MAGNIFICAT_ODE9 =
  "My soul magnifies the Lord, and my spirit rejoices in God my Savior.\n\nMore honorable than the cherubim, and more glorious beyond compare than the seraphim: without defilement you gave birth to God the Word — true Theotokos, we magnify you.\n\nFor He has regarded the low estate of His handmaiden; for behold, henceforth all generations will call me blessed. For He who is mighty has done great things for me, and holy is His name; and His mercy is on those who fear Him from generation to generation.\n\nMore honorable than the cherubim, and more glorious beyond compare than the seraphim: without defilement you gave birth to God the Word — true Theotokos, we magnify you.";

type CanticlesBundle = { odes: { ode: number; name: string; ref: string; text: string }[] };

export const FRAGMENT_COUNT = 2;

/**
 * The featured window at a rotation index: even visits get the grouped
 * troparia moment (matched to the weekday); odd visits tour the canticles.
 */
export function matinsFragment(
  canticles: CanticlesBundle,
  index: number,
  weekday: number,
): Omit<Movement, "kind" | "level"> {
  const which = ((index % FRAGMENT_COUNT) + FRAGMENT_COUNT) % FRAGMENT_COUNT;
  const round = Math.floor(index / FRAGMENT_COUNT);
  if (which === 0) {
    const exap = WEEKDAY_EXAPOSTILARIA[weekday] ?? WEEKDAY_EXAPOSTILARIA[0];
    return {
      label: "A window into Matins",
      ref: "God is the Lord · the day's Exapostilarion · Ode 9, the Song of the Theotokos",
      text: `${GOD_IS_THE_LORD}

—

${exap}

—

${MAGNIFICAT_ODE9}`,
    };
  }
  const odes = canticles.odes;
  const o = odes[round % odes.length];
  return {
    label: "A window into Matins",
    ref: `Ode ${o.ode} of the Canon — ${o.name} (${o.ref})`,
    text: o.text,
  };
}
