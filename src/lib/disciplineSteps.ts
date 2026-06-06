/**
 * TRACK A — the unanchored 60-step personal discipline (LITURGY_DISCIPLINE).
 * Index 0 = step 1 … index 59 = step 60. Advanced by the user's `psalterStep`
 * (engine `psalmIndex` + 1), not by the calendar.
 *
 * Each step is a small mini-office: morning and evening psalm volumes, a short
 * reading, and a concluding collect for each. Psalm texts are stored verbatim
 * as supplied. Where a step is null, the app falls back to the bundled BCP
 * Psalter portion for that step.
 *
 * Provided so far: steps 1, 2, 3, 31. The rest remain null pending real data.
 */

export type DisciplineStep = {
  /** Array 4 — Psalms, Morning Volume (verbatim text, in order). */
  morningPsalms: string[];
  /** Array 4 — Psalms, Evening Volume. */
  eveningPsalms: string[];
  /** Array 5 — Short Focus Reading. */
  morningShortReading?: string;
  eveningShortReading?: string;
  /** Array 2 — Concluding Collect. */
  morningCollect?: string;
  eveningCollect?: string;
  /** Filtered out for Protestant / Evangelical users per the schema directive. */
  isMarianOrSaints?: boolean;
};

export const STEP_COUNT = 60;

export const DISCIPLINE_STEPS: (DisciplineStep | null)[] = Array.from(
  { length: STEP_COUNT },
  () => null,
);

// ---- STEP 1 ----
DISCIPLINE_STEPS[0] = {
  morningPsalms: [
    "Blessed is the man who doesn't walk in the counsel of the wicked, nor stand in the way of sinners, nor sit in the seat of scoffers; but his delight is in the LORD's law. On his law he meditates day and night...",
    "Why do the nations rage, and the peoples plot a vain thing? The kings of the earth take a stand, and the rulers take counsel together, against the LORD, and against his Anointed...",
  ],
  eveningPsalms: [
    "LORD, don't rebuke me in your anger, neither chasten me in your hot displeasure. Have mercy on me, LORD, for I am faint...",
  ],
  morningShortReading: "The night is far spent, and the day is at hand...",
  morningCollect:
    "O Lord God Almighty, who has brought us safely to the beginning of this day...",
};

// ---- STEP 2 ---- (modern WEB phrasing; divine name "Yahweh")
DISCIPLINE_STEPS[1] = {
  morningPsalms: [
    "Yahweh, defend me from my adversaries. Arise, Yahweh, and save me according to your mercy.",
    "Hear my cry, God; listen to my prayer. From the end of the earth I will call to you when my heart is overwhelmed. Lead me to the rock that is higher than I.",
  ],
  eveningPsalms: [
    "The heavens declare the glory of God. The expanse shows his handiwork. Day after day they pour out speech, and night after night they display knowledge.",
  ],
  morningShortReading:
    "For the mind of the flesh is death, but the mind of the Spirit is life and peace.",
  eveningShortReading:
    "Don't let the sun go down on your wrath, and don't give place to the devil.",
  morningCollect:
    "Almighty God, who alone can order the unruly wills and affections of sinful people: Grant to your people that they may love the thing which you command, and desire that which you promise; through Jesus Christ our Lord. Amen.",
  eveningCollect:
    "O God, from whom all holy desires, all good counsels, and all just works proceed: Give to your servants that peace which the world cannot give; through the merits of Jesus Christ our Savior. Amen.",
};

// ---- STEP 3 ----
DISCIPLINE_STEPS[2] = {
  morningPsalms: [
    "The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters.",
    "The earth is the Lord's, and the fullness thereof; the world, and they that dwell therein. For he hath founded it upon the seas, and established it upon the floods.",
  ],
  eveningPsalms: [
    "To thee, O Lord, do I lift up my soul. O my God, I trust in thee: let me not be ashamed, let not mine enemies triumph over me.",
  ],
  morningShortReading:
    "Be renewed in the spirit of your mind, and put on the new man, which after God hath been created in righteousness and holiness of truth.",
  eveningShortReading:
    "He that storeth up treasures for himself is not rich toward God. Seek ye first his kingdom.",
  morningCollect:
    "O Lord, our heavenly Father, almighty and everlasting God, who hast safely brought us to the beginning of this day: Defend us in the same with thy mighty power; and grant that this day we fall into no sin; through Jesus Christ our Lord. Amen.",
  eveningCollect:
    "Be our companion, O Lord, in our paths, and let thy light scatter the darkness of our hearts, that we may walk safely in the light of thy countenance; through Christ our Lord. Amen.",
};

// ---- STEP 4 ----
DISCIPLINE_STEPS[3] = {
  morningPsalms: [
    "Yahweh is my light and my salvation. Whom shall I fear? Yahweh is the strength of my life. Of whom shall I be afraid?",
    "When evil-doers came upon me to eat up my flesh, even my adversaries and my foes, they stumbled and fell.",
  ],
  eveningPsalms: [
    "Hear, Yahweh, when I cry with my voice. Have mercy also on me, and answer me. When you said, 'Seek my face,' my heart said to you, 'Your face, Yahweh, I will seek.'",
  ],
  morningShortReading:
    "For you were once darkness, but now you are light in the Lord. Walk as children of light.",
  eveningShortReading: "Be angry, and don't sin. Don't let the sun go down on your wrath.",
  morningCollect:
    "Almighty God, look onto the hearty desires of your humble servants, and stretch forth the right hand of your Majesty to be our defense against all our enemies; through Jesus Christ our Lord. Amen.",
  eveningCollect:
    "O God, the protector of all who trust in you, without whom nothing is strong, nothing is holy: Increase and multiply your mercy upon us; through Jesus Christ our Lord. Amen.",
};

// ---- STEP 5 ----
DISCIPLINE_STEPS[4] = {
  morningPsalms: [
    "I will extol you, Yahweh, for you have raised me up, and have not made my foes to rejoice over me.",
    "Yahweh my God, I cried to you, and you have healed me.",
  ],
  eveningPsalms: [
    "Sing praise to Yahweh, you saints of his, and give thanks to his holy name. For his anger is but for a moment. His favor is for a lifetime. Weeping may stay for the night, but joy comes in the morning.",
  ],
  morningShortReading:
    "Therefore, if anyone is in Christ, he is a new creation. The old things have passed away. Behold, they have become new.",
  eveningShortReading:
    "So then, let us not sleep, as the rest do, but let us watch and be sober.",
  morningCollect:
    "We beseech you, Almighty God, mercifully to look upon your people, that by your great goodness they may be governed and preserved evermore, both in body and soul; through Jesus Christ our Lord. Amen.",
  eveningCollect:
    "O God, from whom all holy desires, all good counsels, and all just works do proceed: Give to your servants that peace which the world cannot give; through the merits of Jesus Christ our Savior. Amen.",
};

// ---- STEP 6 ----
DISCIPLINE_STEPS[5] = {
  morningPsalms: [
    "In you, Yahweh, I take refuge. Let me never be disappointed. Deliver me in your righteousness.",
    "Bow down your ear to me. Deliver me speedily. Be to me a strong rock, a house of defense to save me.",
  ],
  eveningPsalms: [
    "Into your hand I commend my spirit. You have redeemed me, Yahweh, God of truth. I hate those who regard lying vanities, but I trust in Yahweh.",
  ],
  morningShortReading:
    "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control. Against such things there is no law.",
  eveningShortReading:
    "Don't be anxious for your life, what you will eat, or what you will drink; nor yet for your body, what you will wear. Isn't life more than food, and the body more than clothing?",
  morningCollect:
    "Almighty and everlasting God, who of your tender love toward mankind has sent your Son our Savior Jesus Christ to take upon him our flesh: Mercifully grant that we may follow the example of his patience; through Jesus Christ our Lord. Amen.",
  eveningCollect:
    "Keep watch, dear Lord, with those who work, or watch, or weep this night, and give your angels charge over those who sleep. Tend the sick, give rest to the weary, and soothe the suffering; all for your love's sake. Amen.",
};

// ---- STEP 7 ----
DISCIPLINE_STEPS[6] = {
  morningPsalms: [
    "Blessed is he whose disobedience is forgiven, whose sin is covered.",
    "Blessed is the man to whom Yahweh doesn't impute iniquity, and in whose spirit there is no deceit.",
  ],
  eveningPsalms: [
    "I acknowledged my sin to you. I didn't hide my iniquity. I said, 'I will confess my transgressions to Yahweh,' and you forgave the iniquity of my sin.",
  ],
  morningShortReading:
    "If we say that we have no sin, we deceive ourselves, and the truth is not in us. If we confess our sins, he is faithful and righteous to forgive us our sins, and to cleanse us from all unrighteousness.",
  eveningShortReading:
    "For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus our Lord.",
  morningCollect:
    "Almighty God, who explicitly knows us to be set in the midst of so many and great dangers: Grant to us such strength and protection as may support us in all dangers and carry us through all temptations; through Christ our Lord. Amen.",
  eveningCollect:
    "O God, the source of all enduring peace, visit our homes this night and drive far from them all the snares of the enemy. Let your holy angels dwell herein to preserve us in safety; through Jesus Christ our Lord. Amen.",
};

// ---- STEP 31 ----
DISCIPLINE_STEPS[30] = {
  morningPsalms: [
    "In you, LORD, I take refuge. Let me never be disappointed. Deliver me in your righteousness...",
  ],
  eveningPsalms: [
    "I will bless the LORD at all times. His praise shall continually be in my mouth...",
  ],
  morningShortReading: "Light will shine out of darkness...",
  morningCollect:
    "Almighty God, whose watchfulness never slumbers, clear our minds as we begin the labors of this day...",
};

/** The discipline step (1–60), or null if not yet supplied. */
export function disciplineStep(step: number): DisciplineStep | null {
  if (step < 1 || step > STEP_COUNT) return null;
  return DISCIPLINE_STEPS[step - 1] ?? null;
}
