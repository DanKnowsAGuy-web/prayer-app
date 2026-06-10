/**
 * The fixed material of the EO evening (Vespers-shaped) rule: the psalms of
 * Vespers as a six-stop loop on its own pointer, O Gladsome Light, the
 * weekday prokeimena, and the grouped close of Vespers.
 *
 * Everything here is bundled and traditional/public domain, never fetched.
 * The saint's troparion comes from the same propers bundle the morning uses.
 * Tone-dependent pieces (the stichera at "Lord, I have cried", the aposticha)
 * are intentionally absent, as everywhere in the app.
 */
import type { Movement } from "./resolve";

type PsalterBundle = { psalms: Record<string, { v: number; text: string }[]> };

function psalmText(bundle: PsalterBundle, n: number, from?: number, to?: number): string {
  const verses = bundle.psalms[String(n)] || [];
  const chosen =
    from != null ? verses.filter((v) => v.v >= from && v.v <= (to ?? 999)) : verses;
  return chosen.map((v) => v.text).join("\n");
}

// ── The Psalms of Vespers (the evening psalm slot's fixed loop) ──────────────
//
// The great opening psalm in two parts (so no single visit runs long), then
// the "Lord, I have cried" psalms. One per session, advancing by usage.

const VESPERS_PSALM_LOOP: { n: number; from?: number; to?: number; place: string }[] = [
  { n: 104, from: 1, to: 18, place: "the opening psalm of Vespers" },
  { n: 104, from: 19, to: 35, place: "the opening psalm of Vespers" },
  { n: 141, place: "from 'Lord, I have cried', the evening psalms" },
  { n: 142, place: "from 'Lord, I have cried', the evening psalms" },
  { n: 130, place: "from 'Lord, I have cried', the evening psalms" },
  { n: 117, place: "from 'Lord, I have cried', the evening psalms" },
];

export const VESPERS_PSALM_COUNT = VESPERS_PSALM_LOOP.length; // 6

/** The Vespers psalm at a rotation index (wrapping). */
export function serveVespersPsalm(
  bundle: PsalterBundle,
  index: number,
): Omit<Movement, "kind" | "level"> {
  const i =
    ((index % VESPERS_PSALM_COUNT) + VESPERS_PSALM_COUNT) % VESPERS_PSALM_COUNT;
  const s = VESPERS_PSALM_LOOP[i];
  const label =
    s.from != null ? `Psalm ${s.n}:${s.from}–${s.to}` : `Psalm ${s.n}`;
  return {
    label,
    ref: `A psalm of Vespers · ${s.place}`,
    text: psalmText(bundle, s.n, s.from, s.to),
  };
}

// ── O Gladsome Light and the prokeimenon of the day (a pair) ─────────────────

export const GLADSOME_LIGHT: Omit<Movement, "kind" | "level"> = {
  label: "O Gladsome Light",
  ref: "The evening hymn of Vespers, among the oldest in the Church",
  text: "O Gladsome Light of the holy glory of the immortal Father, heavenly, holy, blessed Jesus Christ. Now that we have come to the setting of the sun and behold the light of evening, we praise God: Father, Son, and Holy Spirit. For meet it is at all times to worship Thee with voices of praise, O Son of God and Giver of Life; therefore all the world glorifies Thee.",
};

/** The fixed Vespers prokeimena, by the weekday of the evening (0=Sun…6=Sat). */
const PROKEIMENA: { text: string; source: string }[] = [
  { text: "Behold now, bless the Lord, all you servants of the Lord.", source: "Psalm 134" },
  { text: "The Lord hears me when I call upon Him.", source: "Psalm 4" },
  { text: "Your mercy, O Lord, shall pursue me all the days of my life.", source: "Psalm 23" },
  { text: "O God, save me by Your name, and judge me by Your strength.", source: "Psalm 54" },
  { text: "My help comes from the Lord, who made heaven and earth.", source: "Psalm 121" },
  { text: "O God, You are my helper, and Your mercy shall go before me.", source: "Psalm 59" },
  { text: "The Lord is King; He is clothed with majesty.", source: "Psalm 93" },
];

export function prokeimenon(weekday: number): Omit<Movement, "kind" | "level"> {
  const p = PROKEIMENA[weekday] ?? PROKEIMENA[0];
  return {
    label: "The prokeimenon of the day",
    text: `${p.text} (twice)\n\n${p.text}`,
    source: p.source,
  };
}

// ── The close of Vespers (the grouped window stop) ───────────────────────────

export const VESPERS_WINDOW: Omit<Movement, "kind" | "level"> = {
  label: "A window into Vespers",
  ref: "Vouchsafe, O Lord · the Prayer of St. Simeon · O Virgin Theotokos: the close of Vespers",
  text: "Vouchsafe, O Lord, to keep us this evening without sin. Blessed art Thou, O Lord, the God of our fathers, and praised and glorified is Thy Name forever. Amen. Let Thy mercy, O Lord, be upon us, as we have set our hope on Thee. Blessed art Thou, O Lord, teach me Thy statutes. Blessed art Thou, O Master, make me to understand Thy commandments. Blessed art Thou, O Holy One, enlighten me with Thy precepts. Thy mercy, O Lord, endures forever; despise not the works of Thy hands. To Thee belongs worship, to Thee belongs praise, to Thee belongs glory: to the Father, and to the Son, and to the Holy Spirit, now and ever, and unto ages of ages. Amen.\n\nLord, now lettest Thou Thy servant depart in peace, according to Thy word; for mine eyes have seen Thy salvation, which Thou hast prepared before the face of all people: a light to enlighten the Gentiles, and the glory of Thy people Israel.\n\nO Virgin Theotokos, rejoice! O Mary full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, for thou hast borne the Savior of our souls.",
};
