/**
 * The classic Eastern Orthodox evening prayers — the short sequence shared by
 * the standard prayer books (Jordanville / OCA-style English), the evening
 * counterpart of eoMorningPrayers.ts. Served one per evening, rotating by
 * usage: praying one advances to the next, so the eleven come round in course.
 * Shown only to Eastern Orthodox users, as part of the evening opening (the
 * floor).
 *
 * All texts are traditional and public domain; renderings follow the common
 * English forms in the OCA-leaning voice the app uses throughout.
 */

export type EoEveningPrayer = {
  /** The traditional attribution, shown as the small line above the text. */
  title: string;
  text: string;
};

export const EO_EVENING_PRAYERS: EoEveningPrayer[] = [
  {
    title: "Of St. Macarius the Great",
    text: "O Eternal God, King of all creation, who hast counted me worthy to attain this hour: forgive me the sins I have committed this day in deed, word, and thought; and cleanse, O Lord, my humble soul from every defilement of flesh and spirit. Grant me, O Lord, to pass the sleep of this night in peace, that rising from my lowly bed, I may please Thy most holy Name all the days of my life, and vanquish the enemies that war against me, both bodily and bodiless. Deliver me, O Lord, from vain thoughts that defile me, and from evil desires. For Thine is the kingdom, and the power, and the glory: of the Father, and of the Son, and of the Holy Spirit, now and ever, and unto ages of ages. Amen.",
  },
  {
    title: "Of St. Antiochus",
    text: "O Ruler of all, Word of the Father, O Jesus Christ, Thou who art Thyself perfect: for the sake of Thy great mercy, never depart from me, but ever abide in me Thy servant. O Jesus, Good Shepherd of Thy sheep, deliver me not over to the rebellion of the serpent, and leave me not to the will of satan, for the seed of corruption is in me. O Lord, adorable God, holy King, Jesus Christ: guard me as I sleep with the unwaning light, Thy Holy Spirit, by whom Thou didst sanctify Thy disciples. Grant me too, Thine unworthy servant, Thy salvation upon my bed. Enlighten my mind with the light of understanding of Thy holy Gospel; my soul, with the love of Thy Cross; my heart, with the purity of Thy word; my body, with Thy passionless Passion. Keep my thought in Thy humility, and raise me up at the proper time to glorify Thee. For most glorified art Thou, together with Thine unoriginate Father and the Most Holy Spirit, unto the ages. Amen.",
  },
  {
    title: "To the Holy Spirit",
    text: "O Lord, Heavenly King, Comforter, Spirit of Truth: take pity and have mercy on me, Thy sinful servant, and forgive me, who am unworthy, all wherein I have sinned against Thee today as a man — sins voluntary and involuntary, known and unknown. If I have sworn by Thy Name, or reproached anyone, or become angered, or slandered or saddened anyone in my anger; or lied, or condemned anyone, or boasted, or been proud; or, standing at prayer, my mind was distracted by the cares of this world; or thought evil, or spoken what ought not to be said; or been heedless of prayer; or done some other evil that I do not remember — for all of this, have mercy, O Master my Creator, on me Thy despondent and unworthy servant. Absolve, remit, and forgive me, as Thou art good and lovest mankind, that I may lie down, sleep, and rest in peace, and may worship, hymn, and glorify Thy most honorable Name, with the Father and His only-begotten Son, now and ever, and unto the ages. Amen.",
  },
  {
    title: "Of St. John Chrysostom",
    text: "O Lord, deprive me not of Thy heavenly good things.\nO Lord, deliver me from eternal torments.\nO Lord, if I have sinned in mind or thought, in word or deed, forgive me.\nO Lord, deliver me from every ignorance and heedlessness, from faintheartedness and stony hardness of heart.\nO Lord, deliver me from every temptation.\nO Lord, enlighten my heart, darkened by evil desire.\nO Lord, I, being human, have sinned; do Thou, being God, forgive me in Thy loving-kindness, for Thou knowest the weakness of my soul.\nO Lord, send down Thy grace to help me, that I may glorify Thy holy Name.\nO Lord Jesus Christ, inscribe me, Thy servant, in the book of life, and grant me a good end.\nO Lord my God, even if I have done nothing good in Thy sight, grant me, according to Thy grace, to make a beginning of good.\nO Lord, sprinkle on my heart the dew of Thy grace.\nO Lord of heaven and earth, remember me, Thy sinful servant, shameful and unclean, in Thy kingdom. Amen.",
  },
  {
    title: "Of St. John Damascene",
    text: "O Master, Lover of mankind: is this couch to be my coffin, or wilt Thou enlighten my wretched soul with another day? Behold, the coffin lies before me; behold, death confronts me. I fear Thy judgment, O Lord, and the endless torments; yet I cease not to do evil. I ever anger Thee, my Lord God, and Thy most pure Mother, and all the heavenly powers, and my holy guardian angel. I know, O Lord, that I am unworthy of Thy love for mankind, but worthy of every condemnation and torment. But, O Lord, whether I will it or not, save me. For to save a righteous man is no great thing, and to have mercy on the pure is nothing wonderful, for they are worthy of Thy mercy. But on me, a sinner, show the wonder of Thy mercy; in this reveal Thy love for mankind, lest my wickedness prevail over Thine ineffable goodness and mercy; and order my life as Thou wilt. Amen.",
  },
  {
    title: "Enlighten mine eyes",
    text: "Enlighten mine eyes, O Christ God, lest at any time I sleep unto death, lest mine enemy say: I have prevailed over him.\n\nBe my soul's defender, O God, for I step over many snares; deliver me from them, and save me, O Good One, for Thou lovest mankind.",
  },
  {
    title: "Into Thy hands",
    text: "Into Thy hands, O Lord Jesus Christ my God, I commend my spirit. Do Thou bless me, do Thou have mercy on me, and grant me life eternal. Amen.",
  },
  {
    title: "To the Guardian Angel",
    text: "O Angel of Christ, my holy guardian and protector of my soul and body: forgive me all wherein I have sinned this day, and deliver me from every wile of the enemy who opposes me, that I may not anger my God by any sin. Pray for me, a sinful and unworthy servant, that thou mayest show me forth worthy of the kindness and mercy of the All-holy Trinity, and of the Mother of my Lord Jesus Christ, and of all the saints. Amen.",
  },
  {
    title: "To the Most Holy Theotokos",
    text: "O good Mother of the good King, most pure and blessed Theotokos Mary: pour out the mercy of thy Son and our God upon my passionate soul, and by thine intercessions guide me unto good works, that I may pass the remaining time of my life without blemish, and attain paradise through thee, O Virgin Theotokos, who alone art pure and blessed. Amen.",
  },
  {
    title: "Of St. Macarius the Great",
    text: "O Lord our God, whatsoever sins I have committed this day in word, deed, and thought, forgive me, as Thou art good and lovest mankind. Grant me peaceful and undisturbed sleep; send me Thy guardian angel to protect and keep me from every evil. For Thou art the guardian of our souls and bodies, and unto Thee do we send up glory: to the Father, and to the Son, and to the Holy Spirit, now and ever, and unto ages of ages. Amen.",
  },
  {
    title: "At the close of the day",
    text: "O Lord Jesus Christ, Son of God, for the sake of the prayers of Thy most pure Mother, of our holy and God-bearing fathers, and of all the saints: have mercy on us and save us, for Thou art good and lovest mankind. Amen.",
  },
];

export const EO_EVENING_COUNT = EO_EVENING_PRAYERS.length; // 11

/** The prayer served at a given rotation index (wrapping). */
export function serveEoEvening(index: number): EoEveningPrayer {
  return EO_EVENING_PRAYERS[((index % EO_EVENING_COUNT) + EO_EVENING_COUNT) % EO_EVENING_COUNT];
}
