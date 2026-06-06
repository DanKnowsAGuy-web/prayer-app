/**
 * LAYER 3 — a litany after the Gelasian form ("Deprecatio Gelasii"), prayed
 * below the Psalms and Gospel. Each petition is answered with the response.
 *
 * The petition commemorating Our Lady and the saints carries
 * `isMarianOrSaints: true` and is omitted for Protestant / Evangelical users
 * (see filterMarian in traditions.ts).
 *
 * Wording is a faithful rendering of the genre and is meant to be edited to
 * your exact preferred text.
 */

export type LitanyPetition = { text: string; isMarianOrSaints?: boolean };

export const LITANY_RESPONSE = "Lord, have mercy.";

export const GELASIAN_LITANY: LitanyPetition[] = [
  { text: "For the peace from above, and for the salvation of our souls, let us pray to the Lord." },
  { text: "For the holy Church of God, spread throughout the world, and for the unity of all, let us pray to the Lord." },
  { text: "For all bishops, priests, and deacons, and for all the clergy and the people, let us pray to the Lord." },
  { text: "For this land, for all in authority, and for peace among the nations, let us pray to the Lord." },
  { text: "For travelers by land, sea, and air; for the sick and the suffering; for the captive; and for their deliverance, let us pray to the Lord." },
  {
    text: "Commemorating our all-holy and blessed Lady, the Theotokos and ever-Virgin Mary, with all the saints, let us commend ourselves and one another, and our whole life, to Christ our God.",
    isMarianOrSaints: true,
  },
  { text: "For a Christian end to our lives, peaceful and without shame, let us pray to the Lord." },
];
