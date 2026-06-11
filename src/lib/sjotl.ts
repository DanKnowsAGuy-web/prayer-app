/**
 * The SJOTL edition: one fixed Orthodox rule, the same arc every day, scaled in
 * depth by the slider. Morning and evening share a common frame (prostrations,
 * the Trisagion and Lord's Prayer, It is Truly Meet, the dismissal, the Jesus
 * Prayer, the daily readings) around a morning or evening variation.
 *
 * The order never changes; the notch (value level) decides how much is prayed,
 * trimming from the top of the rank down. All texts are traditional liturgical
 * prayers in public-domain English or the app's own renderings.
 */
import type { Movement } from "./resolve";
import type { DayPart } from "./daypart";
import { TRISAGION, DISMISSAL } from "./matins";

type Fixed = Omit<Movement, "kind" | "level">;

/** The value rank: floor (1) to full (6 morning / 5 evening). */
export const SJOTL_MAX_LEVEL: Record<DayPart, number> = { morning: 6, evening: 5 };

// ── The shared frame ─────────────────────────────────────────────────────────

const PROSTRATIONS: Fixed = {
  label: "Begin with three prostrations",
  text: "Making the sign of the Cross, bow to the ground three times, saying with each:\n\nO God, be merciful to me a sinner.\nO God, cleanse me a sinner, and have mercy on me.\nThou hast created me; O Lord, have mercy on me.",
};

const LORDS_PRAYER: Fixed = {
  label: "The Lord's Prayer",
  text: "Our Father, who art in heaven, hallowed be Thy name. Thy kingdom come, Thy will be done, on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from the evil one.",
};

const AXION_ESTIN: Fixed = {
  label: "It is Truly Meet",
  text: "It is truly meet to bless thee, O Theotokos, ever-blessed and most pure, and the Mother of our God. More honorable than the cherubim, and more glorious beyond compare than the seraphim, who without corruption gavest birth to God the Word: true Theotokos, we magnify thee.",
  note: "Make a prostration.",
};

const JESUS_PRAYER: Fixed = {
  label: "The Jesus Prayer",
  text: "Lord Jesus Christ, Son of God, have mercy on me, a sinner.",
  note: "Pray slowly and attentively, twenty-five times.",
};

// ── The morning variation ────────────────────────────────────────────────────

const MORNING_TROPARIA: Fixed = {
  label: "Morning hymns",
  ref: "Troparia",
  text: "Having risen from sleep, we fall down before Thee, O Good One, and sing to Thee, O Mighty One, the angelic hymn: Holy, Holy, Holy art Thou, O God; through the Theotokos have mercy on us.\n\nRaise me from the bed of sloth, O Lord, and enlighten my mind and my heart; open my lips to praise Thee, O Holy Trinity: Holy, Holy, Holy art Thou, O God; through the Theotokos have mercy on us.",
};

const RISING_FROM_SLEEP: Fixed = {
  label: "Rising from sleep",
  ref: "A prayer of St. Basil the Great",
  text: "As I rise from sleep, I thank Thee, O Holy Trinity, for in the abundance of Thy goodness and long-suffering Thou wast not wroth with me, slothful and sinful as I am, neither hast Thou destroyed me in my transgressions; but Thou hast shown Thy wonted love toward man, and hast raised me up as I lay in heedlessness, that I might sing my morning hymn and glorify Thy might. Enlighten now the eyes of my understanding, open my mouth to receive Thy words, and teach me Thy commandments; help me to do Thy will, to sing to Thee from my heart, and to praise Thy most holy name: of the Father, and of the Son, and of the Holy Spirit, now and ever, and unto ages of ages. Amen.",
};

const THE_CREED: Fixed = {
  label: "The Symbol of Faith",
  ref: "The Nicene Creed",
  text: "I believe in one God, the Father Almighty, Maker of heaven and earth, and of all things visible and invisible. And in one Lord Jesus Christ, the Son of God, the only-begotten, begotten of the Father before all ages; Light of Light, true God of true God, begotten, not made, of one essence with the Father, by whom all things were made; who for us men and for our salvation came down from heaven, and was incarnate of the Holy Spirit and the Virgin Mary, and became man; and was crucified for us under Pontius Pilate, and suffered, and was buried; and rose again on the third day according to the Scriptures; and ascended into heaven, and sitteth at the right hand of the Father; and shall come again with glory to judge the living and the dead, whose kingdom shall have no end. And in the Holy Spirit, the Lord, the Giver of Life, who proceedeth from the Father, who with the Father and the Son together is worshipped and glorified, who spake by the prophets. In one holy, catholic, and apostolic Church. I confess one baptism for the remission of sins. I look for the resurrection of the dead, and the life of the age to come. Amen.",
};

const OPTINA: Fixed = {
  label: "Prayer of the Elders of Optina",
  text: "O Lord, grant that I may meet all that this coming day brings to me with spiritual tranquility. Grant that I may fully surrender myself to Thy holy will. At every hour of this day, direct and support me in all things. Whatsoever news may reach me in the course of the day, teach me to accept it with a calm soul, in the firm conviction that all is subject to Thy holy will. In all my words and deeds, direct my thoughts and feelings. In all unforeseen occurrences, let me not forget that all are sent down from Thee. Teach me to act firmly and wisely, without embittering or embarrassing others. Give me the strength to bear the fatigue of this coming day with all that it shall bring. Direct my will, and teach me to pray, to believe, to hope, to be patient, to forgive, and to love. Amen.",
};

// ── The evening variation ────────────────────────────────────────────────────

const EVENING_TROPARIA: Fixed = {
  label: "Evening hymns",
  ref: "Troparia",
  text: "Have mercy on us, O Lord, have mercy on us; for laying aside all excuse, we sinners offer to Thee, as our Master, this supplication: have mercy on us.\n\nGlory to the Father, and to the Son, and to the Holy Spirit. Lord, have mercy on us, for in Thee have we put our trust; be not angry with us greatly, neither remember our iniquities; but look down on us now, as Thou art compassionate, and deliver us from our enemies.\n\nBoth now and ever, and unto ages of ages. Amen. Open unto us the door of thy compassion, O blessed Theotokos; hoping in thee, may we not perish; through thee may we be delivered from adversities, for thou art the salvation of the Christian people.",
};

const SUPPLICATION_24: Fixed = {
  label: "Supplication for the hours",
  ref: "The Prayer of the Hours",
  text: "O Thou who at all times and at every hour, in heaven and on earth, art worshipped and glorified, O Christ God, long-suffering and plenteous in mercy, who lovest the righteous and hast mercy on sinners, who callest all to salvation through the promise of good things to come: receive, O Lord, our prayers at this hour, and direct our lives toward Thy commandments. Sanctify our souls, make chaste our bodies, correct our thoughts, and purify our intentions; and deliver us from every sorrow, evil, and pain. Compass us about with Thy holy angels, that guarded and guided by their host we may attain to the unity of the faith and the knowledge of Thine unapproachable glory; for blessed art Thou unto ages of ages. Amen.",
};

/**
 * Assemble the day's rule in its fixed order, each segment carrying its value
 * level. The slider keeps everything at or below the chosen level.
 */
export function assembleSjotl(opts: {
  part: DayPart;
  psalm50?: Movement;
  gospel?: Movement;
  epistle?: Movement;
}): Movement[] {
  const { part, psalm50, gospel, epistle } = opts;
  const out: Movement[] = [];
  const push = (m: Movement | undefined | false) => {
    if (m) out.push(m);
  };

  // The frame opens.
  push({ ...PROSTRATIONS, kind: "rubric", level: 1 });
  push({ ...TRISAGION, kind: "trisagion", level: 1 });
  push({ ...LORDS_PRAYER, kind: "lords", level: 1 });

  if (part === "morning") {
    push({ ...MORNING_TROPARIA, kind: "troparia", level: 4 });
    push({ ...RISING_FROM_SLEEP, kind: "prayer", level: 4 });
    push(psalm50 && { ...psalm50, kind: "fixed-psalm", level: 2 });
    push({ ...THE_CREED, kind: "creed", level: 3 });
    push({ ...OPTINA, kind: "prayer", level: 5 });
    push({ ...AXION_ESTIN, kind: "axion", level: 3 });
  } else {
    push({ ...EVENING_TROPARIA, kind: "troparia", level: 4 });
    push({ ...SUPPLICATION_24, kind: "prayer", level: 3 });
    push({ ...AXION_ESTIN, kind: "axion", level: 2 });
  }

  // The frame closes.
  push({ ...DISMISSAL, kind: "dismissal", level: 1 });
  push({ ...JESUS_PRAYER, kind: "jesus-prayer", level: 1 });

  // The daily readings crown the fullest office.
  const readingLevel = SJOTL_MAX_LEVEL[part];
  push(epistle && { ...epistle, kind: "epistle", level: readingLevel });
  push(gospel && { ...gospel, kind: "gospel", level: readingLevel });

  return out;
}
