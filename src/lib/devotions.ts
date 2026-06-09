/**
 * The Gospel song — Benedictus (the Song of Zechariah) in the morning,
 * Magnificat (the Song of Mary) at night. An opt-in segment of the office.
 * Text is the traditional English (public domain).
 */
import type { Movement } from "./resolve";
import type { DayPart } from "./daypart";

/** The Gospel song for this part of the day. */
export function canticleMovement(part: DayPart): Movement {
  if (part === "evening") {
    return {
      label: "Magnificat (the Song of Mary)",
      source: "Luke 1:46–55",
      text: "My soul doth magnify the Lord,\nand my spirit hath rejoiced in God my Saviour.\nFor he hath regarded the lowliness of his handmaiden;\nfor behold, from henceforth all generations shall call me blessed.\nFor he that is mighty hath magnified me, and holy is his Name.\nAnd his mercy is on them that fear him throughout all generations.\nHe hath shewed strength with his arm;\nhe hath scattered the proud in the imagination of their hearts.\nHe hath put down the mighty from their seat, and hath exalted the humble and meek.\nHe hath filled the hungry with good things, and the rich he hath sent empty away.\nHe remembering his mercy hath holpen his servant Israel,\nas he promised to our forefathers, Abraham and his seed for ever.",
    };
  }
  return {
    label: "Benedictus (the Song of Zechariah)",
    source: "Luke 1:68–79",
    text: "Blessed be the Lord God of Israel,\nfor he hath visited and redeemed his people;\nand hath raised up a mighty salvation for us\nin the house of his servant David;\nas he spake by the mouth of his holy prophets,\nwhich have been since the world began:\nthat we should be saved from our enemies,\nand from the hand of all that hate us.\nTo perform the mercy promised to our fathers,\nand to remember his holy covenant;\nto give knowledge of salvation unto his people\nfor the remission of their sins,\nwhereby the dayspring from on high hath visited us,\nto give light to them that sit in darkness and in the shadow of death,\nand to guide our feet into the way of peace.",
  };
}
