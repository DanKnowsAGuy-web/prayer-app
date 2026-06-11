/**
 * The Song of Scripture track — the Bible's own canticles, sung in course like
 * the Psalter and the intercessory cycle (one per office, advancing by usage).
 * Wholly within the canon; the Gospel canticles (Benedictus, Magnificat) stay
 * fixed to their offices and are not part of this rotation.
 *
 * Each entry carries a one-line italic provenance, shown the first time only
 * (keyed by id; see the reader's seenProvenance). Texts are KJV, public domain.
 */
import type { Movement } from "./resolve";

type Canticle = {
  id: string;
  label: string;
  ref: string;
  text: string;
  provenance: string;
};

export const SONGS_OF_SCRIPTURE: Canticle[] = [
  {
    id: "song-exodus15",
    label: "The Song of Moses",
    ref: "Exodus 15",
    text: "I will sing unto the LORD, for he hath triumphed gloriously: the horse and his rider hath he thrown into the sea. The LORD is my strength and song, and he is become my salvation: he is my God, and I will prepare him an habitation; my father's God, and I will exalt him.",
    provenance: "Israel sang this on the far shore of the sea, among the oldest songs in all Scripture.",
  },
  {
    id: "song-deut32",
    label: "The Song of Moses",
    ref: "Deuteronomy 32",
    text: "Give ear, O ye heavens, and I will speak; and hear, O earth, the words of my mouth. He is the Rock, his work is perfect: for all his ways are judgment: a God of truth and without iniquity, just and right is he.",
    provenance: "Moses taught Israel this song before his death, that they should not forget the LORD.",
  },
  {
    id: "song-1sam2",
    label: "The Song of Hannah",
    ref: "1 Samuel 2",
    text: "My heart rejoiceth in the LORD, mine horn is exalted in the LORD; because I rejoice in thy salvation. There is none holy as the LORD: for there is none beside thee. He raiseth up the poor out of the dust, and lifteth up the beggar from the dunghill, to set them among princes.",
    provenance: "Hannah sang this over her firstborn a thousand years before Christ.",
  },
  {
    id: "song-isaiah12",
    label: "A Song of Isaiah",
    ref: "Isaiah 12",
    text: "Behold, God is my salvation; I will trust, and not be afraid: for the LORD JEHOVAH is my strength and my song; he also is become my salvation. Therefore with joy shall ye draw water out of the wells of salvation. Cry out and shout, thou inhabitant of Zion: for great is the Holy One of Israel in the midst of thee.",
    provenance: "Israel sang this song of salvation seven centuries before Christ.",
  },
  {
    id: "song-isaiah55",
    label: "A Song of the Word",
    ref: "Isaiah 55",
    text: "Seek ye the LORD while he may be found, call ye upon him while he is near: let the wicked forsake his way, and the unrighteous man his thoughts: and let him return unto the LORD, and he will have mercy upon him; and to our God, for he will abundantly pardon.",
    provenance: "Spoken to Israel in exile, six centuries before Christ.",
  },
  {
    id: "song-isaiah38",
    label: "The Song of Hezekiah",
    ref: "Isaiah 38",
    text: "Thou hast in love to my soul delivered it from the pit of corruption: for thou hast cast all my sins behind thy back. The living, the living, he shall praise thee, as I do this day: the father to the children shall make known thy truth.",
    provenance: "King Hezekiah's thanksgiving when God raised him from the edge of death.",
  },
  {
    id: "song-habakkuk3",
    label: "The Song of Habakkuk",
    ref: "Habakkuk 3",
    text: "Although the fig tree shall not blossom, neither shall fruit be in the vines; the labour of the olive shall fail, and the fields shall yield no meat: yet I will rejoice in the LORD, I will joy in the God of my salvation.",
    provenance: "The prophet's prayer, sung to Israel before the Babylonians came.",
  },
  {
    id: "song-jonah2",
    label: "The Prayer of Jonah",
    ref: "Jonah 2",
    text: "I cried by reason of mine affliction unto the LORD, and he heard me; out of the belly of hell cried I, and thou heardest my voice. When my soul fainted within me I remembered the LORD: and my prayer came in unto thee. Salvation is of the LORD.",
    provenance: "Jonah's prayer from the deep, the sign our Lord took for his own.",
  },
  {
    id: "song-ezekiel36",
    label: "A Song of Ezekiel",
    ref: "Ezekiel 36",
    text: "Then will I sprinkle clean water upon you, and ye shall be clean. A new heart also will I give you, and a new spirit will I put within you: and I will take away the stony heart out of your flesh, and I will give you an heart of flesh. And I will put my spirit within you, and cause you to walk in my statutes.",
    provenance: "The promise of a new heart, given to Israel in exile.",
  },
  {
    id: "song-isaiah35",
    label: "A Song of the Wilderness",
    ref: "Isaiah 35",
    text: "The wilderness and the solitary place shall be glad for them; and the desert shall rejoice, and blossom as the rose. And the ransomed of the LORD shall return, and come to Zion with songs and everlasting joy upon their heads: they shall obtain joy and gladness, and sorrow and sighing shall flee away.",
    provenance: "The prophet's vision of the desert in bloom when God comes to save.",
  },
  {
    id: "song-rev15",
    label: "The Song of the Lamb",
    ref: "Revelation 15",
    text: "Great and marvellous are thy works, Lord God Almighty; just and true are thy ways, thou King of saints. Who shall not fear thee, O Lord, and glorify thy name? for thou only art holy: for all nations shall come and worship before thee.",
    provenance: "The song of the redeemed before the throne, given to John on Patmos.",
  },
  {
    id: "song-rev5",
    label: "A Song to the Lamb",
    ref: "Revelation 5",
    text: "Thou art worthy to take the book, and to open the seals thereof: for thou wast slain, and hast redeemed us to God by thy blood out of every kindred, and tongue, and people, and nation. Worthy is the Lamb that was slain to receive power, and riches, and wisdom, and strength, and honour, and glory, and blessing.",
    provenance: "Heaven's new song to the Lamb that was slain.",
  },
  {
    id: "song-philippians2",
    label: "The Hymn of Christ",
    ref: "Philippians 2",
    text: "Who, being in the form of God, thought it not robbery to be equal with God: but made himself of no reputation, and took upon him the form of a servant. He humbled himself, and became obedient unto death, even the death of the cross. Wherefore God also hath highly exalted him, that every knee should bow, and every tongue confess that Jesus Christ is Lord.",
    provenance: "An early hymn of the Church, already sung before Paul set it in his letter to Philippi.",
  },
  {
    id: "song-colossians1",
    label: "The Glory of Christ",
    ref: "Colossians 1",
    text: "Who is the image of the invisible God, the firstborn of every creature: for by him were all things created, that are in heaven, and that are in earth. And he is before all things, and by him all things consist. And he is the head of the body, the church.",
    provenance: "An early confession of Christ's glory, carried in Paul's letter to Colossae.",
  },
];

export const SONG_COUNT = SONGS_OF_SCRIPTURE.length; // 14

/** The Song of Scripture at a rotation index (wrapping). */
export function serveCanticle(index: number): Omit<Movement, "kind" | "level"> {
  const c = SONGS_OF_SCRIPTURE[((index % SONG_COUNT) + SONG_COUNT) % SONG_COUNT];
  return {
    label: c.label,
    ref: c.ref,
    text: c.text,
    provenance: c.provenance,
    provId: c.id,
  };
}
