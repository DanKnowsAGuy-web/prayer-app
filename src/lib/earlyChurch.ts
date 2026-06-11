/**
 * Shared content of the undivided Church — canticles and creeds from before the
 * Great Schism (1054), carrying no Catholic, Orthodox, or Reformed distinctives,
 * so a Protestant or Evangelical may pray them wholeheartedly.
 *
 * These deepen the Protestant/Evangelical office (see resolve.ts): the Apostles'
 * Creed sits in the fuller office as the confession of faith, and the canticles
 * and the original Nicene Creed are opt-ins that extend the session. All texts
 * are traditional English, public domain.
 */
import type { Movement } from "./resolve";
import type { DayPart } from "./daypart";

type Fixed = Omit<Movement, "kind" | "level">;

/** The Apostles' Creed — the ancient baptismal confession of the West. */
export const APOSTLES_CREED: Fixed = {
  label: "The Apostles' Creed",
  text: "I believe in God, the Father almighty, creator of heaven and earth.\n\nI believe in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried; he descended to the dead. On the third day he rose again; he ascended into heaven, is seated at the right hand of the Father, and will come again to judge the living and the dead.\n\nI believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and the life everlasting. Amen.",
};

/** The Nicene Creed in its pre-schism form (381) — without the filioque. */
export const NICENE_CREED: Fixed = {
  label: "The Nicene Creed",
  ref: "The Council of Constantinople, 381 — the original form, without the filioque",
  text: "I believe in one God, the Father Almighty, Maker of heaven and earth, and of all things visible and invisible.\n\nAnd in one Lord Jesus Christ, the only-begotten Son of God, begotten of the Father before all worlds; Light of Light, very God of very God, begotten, not made, being of one substance with the Father, by whom all things were made; who for us men and for our salvation came down from heaven, and was incarnate by the Holy Spirit of the Virgin Mary, and was made man; and was crucified also for us under Pontius Pilate; he suffered and was buried; and the third day he rose again according to the Scriptures, and ascended into heaven, and sitteth on the right hand of the Father; and he shall come again, with glory, to judge both the living and the dead; whose kingdom shall have no end.\n\nAnd I believe in the Holy Spirit, the Lord and Giver of Life, who proceedeth from the Father; who with the Father and the Son together is worshipped and glorified; who spake by the Prophets.\n\nAnd I believe in one holy catholic and apostolic Church; I acknowledge one baptism for the remission of sins; and I look for the resurrection of the dead, and the life of the world to come. Amen.",
};

/** Te Deum Laudamus — the great morning hymn of praise (4th century). */
export const TE_DEUM: Fixed = {
  label: "Te Deum Laudamus",
  ref: "A hymn of the Church, 4th century",
  text: "We praise thee, O God; we acknowledge thee to be the Lord. All the earth doth worship thee, the Father everlasting. To thee all Angels cry aloud, the Heavens and all the Powers therein. To thee Cherubim and Seraphim continually do cry: Holy, Holy, Holy, Lord God of Sabaoth; heaven and earth are full of the majesty of thy glory.\n\nThe glorious company of the Apostles praise thee. The goodly fellowship of the Prophets praise thee. The noble army of Martyrs praise thee. The holy Church throughout all the world doth acknowledge thee: the Father, of an infinite majesty; thine honourable, true, and only Son; also the Holy Ghost, the Comforter.\n\nThou art the King of glory, O Christ. Thou art the everlasting Son of the Father. When thou tookest upon thee to deliver man, thou didst not abhor the Virgin's womb. When thou hadst overcome the sharpness of death, thou didst open the kingdom of heaven to all believers. Thou sittest at the right hand of God, in the glory of the Father. We believe that thou shalt come to be our Judge.\n\nWe therefore pray thee, help thy servants, whom thou hast redeemed with thy precious blood. Make them to be numbered with thy Saints, in glory everlasting.",
};

/** Gloria in Excelsis — the angelic hymn (2nd–4th century). */
export const GLORIA_IN_EXCELSIS: Fixed = {
  label: "Gloria in Excelsis",
  ref: "The greater doxology, an ancient hymn of the Church",
  text: "Glory be to God on high, and on earth peace, good will towards men. We praise thee, we bless thee, we worship thee, we glorify thee, we give thanks to thee for thy great glory, O Lord God, heavenly King, God the Father Almighty.\n\nO Lord, the only-begotten Son, Jesus Christ; O Lord God, Lamb of God, Son of the Father, that takest away the sins of the world, have mercy upon us. Thou that takest away the sins of the world, receive our prayer. Thou that sittest at the right hand of God the Father, have mercy upon us.\n\nFor thou only art holy; thou only art the Lord; thou only, O Christ, with the Holy Ghost, art most high in the glory of God the Father. Amen.",
};

/** Phos Hilaron — the lamp-lighting hymn of evening (3rd century or earlier). */
export const PHOS_HILARON: Fixed = {
  label: "O Gladsome Light",
  ref: "The evening hymn of the Church, among its oldest",
  text: "O Gladsome Light of the holy glory of the immortal Father, heavenly, holy, blessed Jesus Christ. Now that we have come to the setting of the sun and behold the light of evening, we praise God: Father, Son, and Holy Spirit. For meet it is at all times to worship thee with voices of praise, O Son of God and Giver of life; therefore all the world glorifies thee.",
};

/** Nunc Dimittis — the Song of Simeon, the close of the day (Luke 2:29–32). */
export const NUNC_DIMITTIS: Fixed = {
  label: "Nunc Dimittis (the Song of Simeon)",
  source: "Luke 2:29–32",
  text: "Lord, now lettest thou thy servant depart in peace, according to thy word. For mine eyes have seen thy salvation, which thou hast prepared before the face of all people; to be a light to lighten the Gentiles, and to be the glory of thy people Israel.",
};

/** Whether this tradition prays the shared pre-schism Protestant/Evangelical rule. */
export function isProtEvang(tradition: string | null): boolean {
  return tradition === "protestant" || tradition === "evangelical";
}

/** The opt-in early-Church canticles offered for a part of the day. */
export function earlyChurchCanticles(part: DayPart): Fixed[] {
  return part === "evening"
    ? [PHOS_HILARON, NUNC_DIMITTIS]
    : [TE_DEUM, GLORIA_IN_EXCELSIS];
}
