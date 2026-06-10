/**
 * The classic Eastern Orthodox morning prayers — the short sequence shared by
 * the standard prayer books (Jordanville / OCA-style English). Served one per
 * morning, rotating by usage: praying one advances to the next, so the eleven
 * come round in course. Shown only to Eastern Orthodox users, as part of the
 * morning opening (the floor).
 *
 * All texts are traditional and public domain; renderings follow the common
 * English forms in the OCA-leaning voice the app uses throughout.
 */

export type EoMorningPrayer = {
  /** The traditional attribution, shown as the small line above the text. */
  title: string;
  text: string;
};

export const EO_MORNING_PRAYERS: EoMorningPrayer[] = [
  {
    title: "Of St. Basil the Great",
    text: "As I rise from sleep, I thank Thee, O Holy Trinity, for through Thy great goodness and patience Thou wast not angered with me, an idler and sinner, nor hast Thou destroyed me in my sins; but Thou hast shown Thy customary love for mankind, and raised me up as I lay in despair, that I might sing the morning hymn and glorify Thy sovereignty. Enlighten the eyes of my understanding, open my ears to receive Thy words, and teach me Thy commandments. Help me to do Thy will, to sing to Thee, to confess Thee from my heart, and to praise Thine all-holy Name: of the Father, and of the Son, and of the Holy Spirit, now and ever, and unto ages of ages. Amen.",
  },
  {
    title: "Of St. Macarius the Great",
    text: "O God, cleanse me a sinner, for I have never done anything good in Thy sight; but deliver me from the evil one, and let Thy will be in me, that I may open my unworthy mouth without condemnation and praise Thy holy Name: of the Father, and of the Son, and of the Holy Spirit, now and ever, and unto ages of ages. Amen.",
  },
  {
    title: "Of St. Macarius the Great",
    text: "O God, who art from everlasting: having risen from sleep, I run to Thee, O Master, Lover of mankind, and by Thy loving-kindness I strive to do Thy work. I pray Thee: help me at all times, in all things; deliver me from every evil thing of this world and from every assault of the devil; save me, and bring me into Thine eternal kingdom. For Thou art my Creator, the Giver and Provider of every good; in Thee is all my hope, and unto Thee do I send up glory, now and ever, and unto ages of ages. Amen.",
  },
  {
    title: "Of the Optina Elders",
    text: "O Lord, grant that I may meet all that this coming day brings to me with spiritual tranquility. Grant that I may fully surrender myself to Thy holy will. At every hour of this day, direct and support me in all things. Whatsoever news may reach me in the course of the day, teach me to accept it with a calm soul, in the firm conviction that all is subject to Thy holy will. Direct my thoughts and feelings in all my words and actions. In all unexpected occurrences, do not let me forget that all is sent down from Thee. Grant that I may deal straightforwardly and wisely with every member of my family, neither embarrassing nor saddening anyone. O Lord, grant me the strength to endure the fatigue of the coming day and all the events that take place during it. Direct my will, and teach me to pray, to believe, to hope, to be patient, to forgive, and to love. Amen.",
  },
  {
    title: "Of St. Philaret of Moscow",
    text: "O Lord, I know not what to ask of Thee. Thou alone knowest what I need. Thou lovest me more than I know how to love myself. O Father, grant unto me, Thy servant, all that I cannot ask. I dare not ask either a cross or consolation: I only stand before Thee with my heart open. Thou seest the needs of which I myself am unaware. Behold, and act according to Thy mercy. Smite and heal me, cast me down and raise me up. I worship in silence before Thy holy will and Thine inscrutable ways. I offer myself as a sacrifice to Thee. I have no other desire than to fulfill Thy will. Teach me to pray. Do Thou Thyself pray within me. Amen.",
  },
  {
    title: "The Prayer of the Hours",
    text: "O Thou who at all times and at every hour, in heaven and on earth, art worshipped and glorified, O Christ God: long-suffering, plenteous in mercy, most compassionate, who lovest the righteous and hast mercy on sinners; who callest all to salvation through the promise of good things to come: receive, O Lord, our prayers at this hour, and direct our life toward Thy commandments. Sanctify our souls, make chaste our bodies, correct our thoughts, purify our intentions, and deliver us from every sorrow, evil, and pain. Compass us about with Thy holy angels, that guarded and guided by their host, we may attain to the unity of the faith and the knowledge of Thine unapproachable glory: for blessed art Thou unto ages of ages. Amen.",
  },
  {
    title: "To the Guardian Angel",
    text: "O holy Angel, who standest by my wretched soul and my passionate life: forsake not me, a sinner, nor depart from me because of my intemperance. Give no place for the evil demon to gain mastery over me through the violence of this mortal body. Strengthen my poor and feeble hand, and guide me in the way of salvation. O holy Angel of God, guardian and protector of my wretched soul and body: forgive me all wherein I have offended thee every day of my life; and if I have sinned in any way this past night, shelter me this day, and keep me from every temptation of the enemy, that I may not anger God by any sin. Pray for me to the Lord, that He may establish me in His fear, and show me, His servant, to be worthy of His goodness. Amen.",
  },
  {
    title: "To the Most Holy Theotokos",
    text: "O most holy Theotokos, my Lady: by thy holy and all-powerful prayers banish from me, thy lowly and wretched servant, despondency, forgetfulness, folly, and carelessness, and every impure, evil, and blasphemous thought from my wretched heart and my darkened mind. Quench the flame of my passions, for I am poor and wretched; deliver me from my many cruel memories and deeds, and free me from all their evil effects. For blessed art thou by all generations, and glorified is thy most honorable name unto ages of ages. Amen.",
  },
  {
    title: "Of St. Basil the Great",
    text: "O Almighty Lord, God of the powers and of all flesh, who dwellest on high and lookest down on things that are lowly; who searchest the hearts and inmost being, and clearly foreknowest the secrets of men; O unoriginate and everlasting Light, in whom there is no change nor shadow of variation: do Thou Thyself, O immortal King, receive our supplications which at this present time we offer unto Thee from defiled lips; and forgive us all our transgressions, committed in deed, word, or thought, knowingly or unknowingly; and cleanse us from every defilement of flesh and spirit. Grant us to pass the night of the whole present life with watchful heart and sober thought, awaiting the coming of the radiant and appointed day of Thine only-begotten Son, our Lord and God and Savior, Jesus Christ; that we may be found worthy of the joy of His bridal chamber, with our lamps burning. For Thou art our God, and unto Thee do we send up glory: to the Father, and to the Son, and to the Holy Spirit, now and ever, and unto ages of ages. Amen.",
  },
  {
    title: "Of St. Macarius the Great",
    text: "Having risen from sleep, I offer unto Thee, O Savior, the midnight hymn, and falling down I cry unto Thee: grant me not to fall asleep in the death of sin, but have compassion on me, O Thou who wast voluntarily crucified; hasten to raise me who lie in slothfulness, and save me in prayer and intercession; and after the night's sleep, shine upon me a sinless day, O Christ God, and save me. Amen.",
  },
  {
    title: "Of St. Macarius the Great",
    text: "O Lord, who in Thine abundant goodness and great compassion hast granted me, Thy servant, to pass the time of this past night without attack from any opposing evil: do Thou Thyself, O Master, Creator of all things, count me worthy by Thy true light, and with an enlightened heart, to do Thy will, now and ever, and unto ages of ages. Amen.",
  },
];

export const EO_MORNING_COUNT = EO_MORNING_PRAYERS.length; // 11

/** The prayer served at a given rotation index (wrapping). */
export function serveEoMorning(index: number): EoMorningPrayer {
  return EO_MORNING_PRAYERS[((index % EO_MORNING_COUNT) + EO_MORNING_COUNT) % EO_MORNING_COUNT];
}
