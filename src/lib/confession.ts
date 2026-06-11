/**
 * Confession & assurance — a penitential prayer answered by a word of grace,
 * sung in course (one pairing per office, advancing by usage). The confession
 * is never left open: it always lands on the promise of God.
 *
 * The Scripture confessions carry only their reference; the Prayer of Manasseh
 * carries a one-line italic provenance, shown the first time only. KJV text.
 */
import type { Movement } from "./resolve";

type Pairing = {
  id: string;
  /** "Confession" by default; the Manasseh entry overrides it. */
  label?: string;
  ref: string;
  text: string;
  /** Shown the first time only (the Manasseh entry alone). */
  provenance?: string;
  assuranceRef: string;
  assuranceText: string;
};

export const CONFESSIONS: Pairing[] = [
  {
    id: "conf-psalm51",
    ref: "Psalm 51",
    text: "Have mercy upon me, O God, according to thy lovingkindness: according unto the multitude of thy tender mercies blot out my transgressions. Create in me a clean heart, O God; and renew a right spirit within me. Cast me not away from thy presence; and take not thy holy spirit from me. Restore unto me the joy of thy salvation.",
    assuranceRef: "1 John 1:9",
    assuranceText: "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.",
  },
  {
    id: "conf-psalm130",
    ref: "Psalm 130",
    text: "Out of the depths have I cried unto thee, O LORD. Lord, hear my voice. If thou, LORD, shouldest mark iniquities, O Lord, who shall stand? But there is forgiveness with thee, that thou mayest be feared. With the LORD there is mercy, and with him is plenteous redemption.",
    assuranceRef: "Isaiah 1:18",
    assuranceText: "Come now, and let us reason together, saith the LORD: though your sins be as scarlet, they shall be as white as snow; though they be red like crimson, they shall be as wool.",
  },
  {
    id: "conf-psalm32",
    ref: "Psalm 32",
    text: "I acknowledged my sin unto thee, and mine iniquity have I not hid. I said, I will confess my transgressions unto the LORD; and thou forgavest the iniquity of my sin.",
    assuranceRef: "Psalm 103",
    assuranceText: "The LORD is merciful and gracious, slow to anger, and plenteous in mercy. As far as the east is from the west, so far hath he removed our transgressions from us.",
  },
  {
    id: "conf-psalm6",
    ref: "Psalm 6",
    text: "O LORD, rebuke me not in thine anger, neither chasten me in thy hot displeasure. Have mercy upon me, O LORD; for I am weak: O LORD, heal me. Return, O LORD, deliver my soul: oh save me for thy mercies' sake.",
    assuranceRef: "Matthew 11:28",
    assuranceText: "Come unto me, all ye that labour and are heavy laden, and I will give you rest. Take my yoke upon you, and learn of me; and ye shall find rest unto your souls.",
  },
  {
    id: "conf-daniel9",
    ref: "Daniel 9",
    text: "O Lord, the great and dreadful God, we have sinned, and have committed iniquity. O Lord, to us belongeth confusion of face: but to the Lord our God belong mercies and forgivenesses, though we have rebelled against him.",
    assuranceRef: "Micah 7:18",
    assuranceText: "Who is a God like unto thee, that pardoneth iniquity? He retaineth not his anger for ever, because he delighteth in mercy. He will cast all their sins into the depths of the sea.",
  },
  {
    id: "conf-manasseh",
    label: "A prayer of repentance",
    ref: "The Prayer of Manasseh",
    text: "And now I bow the knee of mine heart, beseeching thee of grace. I have sinned, O Lord, I have sinned, and I acknowledge mine iniquities: forgive me, O Lord, forgive me, and destroy me not. For thou art the God of them that repent.",
    provenance: "An ancient prayer of repentance in the mouth of King Manasseh, prayed by the Church for many centuries.",
    assuranceRef: "1 Timothy 1:15",
    assuranceText: "This is a faithful saying, and worthy of all acceptation, that Christ Jesus came into the world to save sinners.",
  },
];

export const CONFESSION_COUNT = CONFESSIONS.length; // 6

export type ConfessionPair = {
  confession: Omit<Movement, "kind" | "level">;
  assurance: Omit<Movement, "kind" | "level">;
};

/** The confession-and-assurance pairing at a rotation index (wrapping). */
export function serveConfession(index: number): ConfessionPair {
  const c = CONFESSIONS[((index % CONFESSION_COUNT) + CONFESSION_COUNT) % CONFESSION_COUNT];
  return {
    confession: {
      label: c.label ?? "Confession",
      ref: c.ref,
      text: c.text,
      ...(c.provenance ? { provenance: c.provenance, provId: c.id } : {}),
    },
    assurance: {
      label: "The promise of God",
      ref: c.assuranceRef,
      text: c.assuranceText,
    },
  };
}
