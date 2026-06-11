/**
 * "A word from the early Church" — a reflection track of prayers and sayings
 * from the fathers of the undivided Church (1st through 8th century), sung in
 * course like the cycle (one per office, advancing by usage). Their own words,
 * attributed but never invoked. Texts are public-domain renderings; a few are
 * faithfully adapted to prayer form from a father's writings.
 *
 * Each carries the persistent attribution (name and period) and a one-line
 * italic provenance shown the first time only (keyed by id).
 */
import type { Movement } from "./resolve";

type Word = {
  id: string;
  /** "Augustine of Hippo" */
  who: string;
  /** "354–430" or "5th century" */
  period: string;
  text: string;
  provenance: string;
};

export const EARLY_CHURCH_WORDS: Word[] = [
  {
    id: "ecw-clement-rome",
    who: "Clement of Rome",
    period: "1st century",
    text: "Grant unto us, O Lord, that we may hope on thy name, the wellspring of all creation; open the eyes of our hearts to know thee, who alone abidest highest among the high.",
    provenance: "Clement led the church at Rome while the apostles' own hearers still lived, and this is among the oldest Christian prayers outside Scripture.",
  },
  {
    id: "ecw-ignatius",
    who: "Ignatius of Antioch",
    period: "c. 35–108",
    text: "Let nothing seen or unseen keep me from gaining Christ. There is in me no fire of earthly longing, but only living water, springing up and saying within me, Come to the Father.",
    provenance: "Ignatius wrote this on the road to his death at Rome, early in the second century.",
  },
  {
    id: "ecw-polycarp",
    who: "Polycarp of Smyrna",
    period: "c. 69–155",
    text: "O Lord God Almighty, Father of thy beloved Son Jesus Christ, I bless thee that thou hast counted me worthy of this day and this hour. I praise thee, I bless thee, I glorify thee, through the eternal High Priest.",
    provenance: "Polycarp prayed this at the stake, an old man who had learned the faith from the apostle John.",
  },
  {
    id: "ecw-didache",
    who: "The Didache",
    period: "1st century",
    text: "We give thee thanks, our Father, for the holy vine of David thy servant, which thou hast made known to us through Jesus. As the broken bread was scattered and gathered into one, so let thy Church be gathered from the ends of the earth into thy kingdom.",
    provenance: "Among the first prayers the Church ever taught, written while the apostles' generation still lived.",
  },
  {
    id: "ecw-clement-alex",
    who: "Clement of Alexandria",
    period: "c. 150–215",
    text: "Shepherd of tender youth, guiding in love and truth through devious ways: Christ our triumphant King, we come thy name to sing, and here our children bring to shout thy praise.",
    provenance: "The earliest Christian hymn we can name by its author, from the close of the second century.",
  },
  {
    id: "ecw-irenaeus",
    who: "Irenaeus of Lyons",
    period: "c. 130–202",
    text: "The glory of God is a living man, and the life of man is the vision of God. For the manifestation of the Father through the Word gives life to those who see God.",
    provenance: "Irenaeus learned the faith from Polycarp, who had learned it from John.",
  },
  {
    id: "ecw-tertullian",
    who: "Tertullian of Carthage",
    period: "c. 160–225",
    text: "Prayer is the wall of faith, our armour against the foe. Let us never go forth unarmed: by day let us remember the rule of prayer, by night let prayer raise us from our bed.",
    provenance: "Tertullian first wrote of these things in the Latin tongue, near the year 200.",
  },
  {
    id: "ecw-cyprian",
    who: "Cyprian of Carthage",
    period: "c. 210–258",
    text: "Let us who are in Christ continue in prayer, watchful and instant. The Lord teaches us to pray in secret, that we may know that God is present everywhere.",
    provenance: "Cyprian, a bishop and martyr of Carthage, in the third century.",
  },
  {
    id: "ecw-athanasius",
    who: "Athanasius of Alexandria",
    period: "c. 296–373",
    text: "Thou, O Christ, art all that I have need of. Thou wast made man that we might be made like God; thou didst take our nature, that we might share in thine.",
    provenance: "Athanasius stood almost alone for the godhead of Christ in the fourth century.",
  },
  {
    id: "ecw-ephrem",
    who: "Ephrem the Syrian",
    period: "c. 306–373",
    text: "Lord and Master of my life, take from me the spirit of sloth, despair, lust of power, and idle talk; and give to me the spirit of soberness, humility, patience, and love. Grant me to see my own faults and not to judge my brother.",
    provenance: "Ephrem the Syrian, poet and deacon of the fourth century.",
  },
  {
    id: "ecw-basil",
    who: "Basil the Great",
    period: "330–379",
    text: "We bless thee, O God most high and Lord of mercy, who art ever doing great and inscrutable things with us; who givest us sleep for rest, and refreshment from the weariness of our toil.",
    provenance: "Basil, bishop of Caesarea, who gave the Eastern church its order of prayer.",
  },
  {
    id: "ecw-gregory-naz",
    who: "Gregory of Nazianzus",
    period: "329–390",
    text: "To thee, O Word, I owe my life; help me to keep it pure and holy. Thou art the way, the truth, the life: lead me, teach me, dwell in me.",
    provenance: "Gregory of Nazianzus, called the Theologian, in the fourth century.",
  },
  {
    id: "ecw-ambrose",
    who: "Ambrose of Milan",
    period: "c. 339–397",
    text: "O Christ, splendour of the Father's glory, light of light and fountain of light, true day enlightening the day: pour upon us thy bright beams, and let the morning star of thy grace arise within our hearts.",
    provenance: "Ambrose, bishop of Milan, whose preaching drew Augustine to Christ.",
  },
  {
    id: "ecw-chrysostom",
    who: "John Chrysostom",
    period: "c. 347–407",
    text: "O thou who hast given us grace to make our common prayers unto thee, fulfil now the desires of thy servants as may be best for them; granting us in this world knowledge of thy truth, and in the world to come life everlasting.",
    provenance: "Chrysostom, the golden-mouthed preacher of Antioch and Constantinople.",
  },
  {
    id: "ecw-augustine-1",
    who: "Augustine of Hippo",
    period: "354–430",
    text: "Thou hast made us for thyself, O Lord, and our heart is restless until it rests in thee. Late have I loved thee, beauty so ancient and so new, late have I loved thee.",
    provenance: "Augustine wrote this near the year 400, the prayer of a restless heart finally caught by grace.",
  },
  {
    id: "ecw-augustine-2",
    who: "Augustine of Hippo",
    period: "354–430",
    text: "Give what thou commandest, and command what thou wilt. O Love that ever burnest and art never quenched, O Charity my God, kindle me.",
    provenance: "Augustine, on the grace that gives what it asks.",
  },
  {
    id: "ecw-jerome",
    who: "Jerome",
    period: "c. 342–420",
    text: "O Lord, thou hast given us thy Word for a light to shine upon our path. Grant us so to meditate on that Word that we may find in it the light that shineth more and more unto the perfect day.",
    provenance: "Jerome, who gave the West the Scriptures in its own tongue.",
  },
  {
    id: "ecw-hilary",
    who: "Hilary of Poitiers",
    period: "c. 310–367",
    text: "Keep, I pray thee, this my faith undefiled, that to my last breath I may hold fast what I professed when I was baptized in the Father, and the Son, and the Holy Spirit.",
    provenance: "Hilary of Poitiers, a defender of the faith in the West.",
  },
  {
    id: "ecw-cyril-jer",
    who: "Cyril of Jerusalem",
    period: "c. 313–386",
    text: "The Lord is loving unto man, and swift to pardon. Let no man despair of his own salvation; only believe, and the grace of God is at hand.",
    provenance: "Cyril taught the new believers of Jerusalem in the fourth century.",
  },
  {
    id: "ecw-patrick",
    who: "Patrick of Ireland",
    period: "5th century",
    text: "Christ with me, Christ before me, Christ behind me, Christ in me, Christ beneath me, Christ above me, Christ in every eye that sees me, Christ in every ear that hears me.",
    provenance: "Patrick prayed this as a shield of faith while carrying the gospel through Ireland.",
  },
  {
    id: "ecw-leo",
    who: "Leo the Great",
    period: "c. 400–461",
    text: "Christian, remember thy dignity. Remember whose body thou art a member, and the price wherewith thou wast redeemed.",
    provenance: "Leo, bishop of Rome, in the fifth century.",
  },
  {
    id: "ecw-cassian",
    who: "John Cassian",
    period: "c. 360–435",
    text: "O God, make speed to save me; O Lord, make haste to help me. This little verse the soul should ceaselessly pour forth: in trouble that we may be delivered, in peace that we may be kept humble.",
    provenance: "Cassian carried the wisdom of the desert to the West, in the fifth century.",
  },
  {
    id: "ecw-benedict",
    who: "Benedict of Nursia",
    period: "c. 480–547",
    text: "Grant, O Lord, that we may listen with the ear of the heart, and run with ready feet the way of thy commandments. Whatever good work thou biddest us begin, may we bring to completion by thy help.",
    provenance: "Benedict, whose rule shaped the prayer of monks for centuries.",
  },
  {
    id: "ecw-columba",
    who: "Columba of Iona",
    period: "521–597",
    text: "Be a bright flame before me, a guiding star above me, a smooth path beneath me, and a kindly shepherd behind me, this day and for evermore.",
    provenance: "Columba, who carried the gospel from Ireland to Iona.",
  },
  {
    id: "ecw-columbanus",
    who: "Columbanus",
    period: "543–615",
    text: "Grant me, I pray thee, in the name of Jesus Christ thy Son my God, that love which knoweth no fall, that my lamp may ever burn and never be quenched.",
    provenance: "Columbanus, an Irish pilgrim who founded monasteries across Europe.",
  },
  {
    id: "ecw-gregory-great",
    who: "Gregory the Great",
    period: "c. 540–604",
    text: "O Lord, smite the rock of my hard heart, that it may bring forth the waters of repentance; and give me, I pray thee, a heart to seek thee and to find.",
    provenance: "Gregory, bishop of Rome and friend of the English, near the year 600.",
  },
  {
    id: "ecw-bede",
    who: "Bede the Venerable",
    period: "c. 673–735",
    text: "I pray thee, merciful Jesus, that as thou hast given me to drink in with delight the words of thy knowledge, so thou wouldest grant me to come at length to thee, the fountain of all wisdom, and to stand before thy face for ever.",
    provenance: "Bede, the gentle scholar of the English church, near the year 700.",
  },
  {
    id: "ecw-john-damascus",
    who: "John of Damascus",
    period: "c. 675–749",
    text: "O Lord, as I lie down to sleep, grant me the peace that the world cannot give, and let me rest in thee; for thou alone makest me to dwell in safety. Into thy hands I commend my spirit.",
    provenance: "John of Damascus, the last of the early Greek fathers, in the eighth century.",
  },
];

export const WORD_COUNT = EARLY_CHURCH_WORDS.length; // 28

/** The reflection at a rotation index (wrapping). */
export function serveReflection(index: number): Omit<Movement, "kind" | "level"> {
  const w = EARLY_CHURCH_WORDS[((index % WORD_COUNT) + WORD_COUNT) % WORD_COUNT];
  return {
    label: "A word from the early Church",
    ref: `${w.who} · ${w.period}`,
    text: w.text,
    provenance: w.provenance,
    provId: w.id,
  };
}
