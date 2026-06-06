/**
 * Optional devotional elements a person may already practice, added to their
 * rule when chosen. Texts are traditional / public domain — edit freely.
 * "Devotional" is intentionally a content-light prompt for now.
 */
import type { Movement } from "./resolve";
import type { DayPart } from "./daypart";
import { weekdayOf } from "./engine";

export function jesusPrayerMovement(): Movement {
  return {
    label: "The Jesus Prayer",
    text: "Lord Jesus Christ, Son of God, have mercy on me, a sinner.",
    note: "Pray it slowly and repeatedly, with the breath, for as long as you wish.",
  };
}

export function devotionalMovement(): Movement {
  return {
    label: "Personal Devotion",
    text: "Spend a few moments in your own devotional reading or prayer.",
    note: "Read, reflect, or pray in your own words, as you are led.",
  };
}

/** The Daily Office Gospel canticle: Benedictus in the morning, Magnificat at night. */
export function canticleMovement(part: DayPart): Movement {
  if (part === "evening") {
    return {
      label: "The Magnificat",
      source: "Luke 1:46–55",
      text: "My soul doth magnify the Lord,\nand my spirit hath rejoiced in God my Saviour.\nFor he hath regarded the lowliness of his handmaiden;\nfor behold, from henceforth all generations shall call me blessed.\nFor he that is mighty hath magnified me, and holy is his Name.\nAnd his mercy is on them that fear him throughout all generations.\nHe hath shewed strength with his arm;\nhe hath scattered the proud in the imagination of their hearts.\nHe hath put down the mighty from their seat, and hath exalted the humble and meek.\nHe hath filled the hungry with good things, and the rich he hath sent empty away.\nHe remembering his mercy hath holpen his servant Israel,\nas he promised to our forefathers, Abraham and his seed for ever.",
    };
  }
  return {
    label: "The Benedictus",
    source: "Luke 1:68–79",
    text: "Blessed be the Lord God of Israel,\nfor he hath visited and redeemed his people;\nand hath raised up a mighty salvation for us\nin the house of his servant David;\nas he spake by the mouth of his holy prophets,\nwhich have been since the world began:\nthat we should be saved from our enemies,\nand from the hand of all that hate us.\nTo perform the mercy promised to our fathers,\nand to remember his holy covenant;\nto give knowledge of salvation unto his people\nfor the remission of their sins,\nwhereby the dayspring from on high hath visited us,\nto give light to them that sit in darkness and in the shadow of death,\nand to guide our feet into the way of peace.",
  };
}

const MYSTERY_SETS: Record<string, { name: string; list: string[] }> = {
  joyful: {
    name: "Joyful",
    list: [
      "The Annunciation",
      "The Visitation",
      "The Nativity",
      "The Presentation",
      "The Finding in the Temple",
    ],
  },
  sorrowful: {
    name: "Sorrowful",
    list: [
      "The Agony in the Garden",
      "The Scourging at the Pillar",
      "The Crowning with Thorns",
      "The Carrying of the Cross",
      "The Crucifixion",
    ],
  },
  glorious: {
    name: "Glorious",
    list: [
      "The Resurrection",
      "The Ascension",
      "The Descent of the Holy Spirit",
      "The Assumption",
      "The Coronation of Our Lady",
    ],
  },
  luminous: {
    name: "Luminous",
    list: [
      "The Baptism of the Lord",
      "The Wedding at Cana",
      "The Proclamation of the Kingdom",
      "The Transfiguration",
      "The Institution of the Eucharist",
    ],
  },
};

// Sunday … Saturday.
const WEEKDAY_MYSTERY = [
  "glorious",
  "joyful",
  "sorrowful",
  "glorious",
  "luminous",
  "sorrowful",
  "joyful",
];

export function rosaryMovements(date: string): Movement[] {
  const set = MYSTERY_SETS[WEEKDAY_MYSTERY[weekdayOf(date)]];
  const list = set.list.map((m, i) => `${i + 1}. ${m}`).join("\n");
  return [
    {
      label: "The Holy Rosary",
      text: `Today: the ${set.name} Mysteries\n\n${list}\n\nBegin with the Sign of the Cross and the Apostles' Creed, then an Our Father, three Hail Marys, and the Glory Be. On each mystery, pray an Our Father, ten Hail Marys, and the Glory Be, meditating upon it.`,
    },
    {
      label: "Hail Mary",
      text: "Hail Mary, full of grace, the Lord is with thee; blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
    },
  ];
}
