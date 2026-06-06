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
    "Blessed is the man who doesn't walk in the counsel of the wicked, nor stand in the way of sinners, nor sit in the seat of scoffers; but his delight is in Yahweh's law. On his law he meditates day and night...",
    "Why do the nations rage, and the peoples plot a vain thing? The kings of the earth take a stand, and the rulers take counsel together, against Yahweh, and against his Anointed...",
  ],
  eveningPsalms: [
    "Yahweh, don't rebuke me in your anger, neither chasten me in your hot displeasure. Have mercy on me, Yahweh, for I am faint...",
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
    "Almighty God, who mercifully knows us to be set in the midst of so many and great dangers: Grant to us such strength and protection as may support us in all dangers and carry us through all temptations; through Christ our Lord. Amen.",
  eveningCollect:
    "O God, the source of all enduring peace, visit our homes this night and drive far from them all the snares of the enemy. Let your holy angels dwell herein to preserve us in safety; through Jesus Christ our Lord. Amen.",
};

// ---- STEP 8 ----
DISCIPLINE_STEPS[7] = {
  morningPsalms: [
    "Yahweh, don't rebuke me in your anger, neither chasten me in your hot displeasure.",
    "Have mercy on me, Yahweh, for I am faint. Yahweh, heal me, for my bones are troubled.",
  ],
  eveningPsalms: [
    "My soul is also deeply troubled. But you, Yahweh—how long? Return, Yahweh. Deliver my soul. Save me for your loving kindness' sake.",
  ],
  morningShortReading:
    "For if you live after the flesh, you must die; but if by the Spirit you put to death the deeds of the body, you will live.",
  eveningShortReading:
    "Behold, I stand at the door and knock. If anyone hears my voice and opens the door, I will come in to him, and will dine with him, and he with me.",
  morningCollect:
    "O God, who provides for your people by your power, and rules over them in love: Grant to us the spirit of wisdom and understanding, that we may walk in your fear all the days of our life; through Jesus Christ our Lord. Amen.",
  eveningCollect:
    "O God, from whom all holy desires, all good counsels, and all just works do proceed: Give to your servants that peace which the world cannot give; through the merits of Jesus Christ our Savior. Amen.",
};

// ---- STEP 9 ----
DISCIPLINE_STEPS[8] = {
  morningPsalms: [
    "I will give thanks to Yahweh with my whole heart. I will tell of all your marvelous works.",
    "I will be glad and rejoice in you. I will sing praise to your name, O Most High.",
  ],
  eveningPsalms: [
    "When my enemies turn back, they stumble and perish at your presence. For you have maintained my right and my cause.",
  ],
  morningShortReading:
    "But you are a chosen race, a royal priesthood, a holy nation, a people for God's own possession, that you may proclaim the excellence of him who called you out of darkness into his marvelous light.",
  eveningShortReading:
    "Don't let your heart be troubled. Believe in God. Believe also in me.",
  morningCollect:
    "Almighty and everlasting God, who art always more ready to hear than we to pray, and art wont to give more than either we desire or deserve: Pour down upon us the abundance of your mercy; through Jesus Christ our Lord. Amen.",
  eveningCollect:
    "Lighten our darkness, we beseech you, O Lord; and by your great mercy defend us from all perils and dangers of this night; for the love of your only Son, our Savior Jesus Christ. Amen.",
};

// ---- STEP 10 ----
DISCIPLINE_STEPS[9] = {
  morningPsalms: [
    "Why do you stand far off, Yahweh? Why do you hide yourself in times of trouble?",
    "In arrogance the wicked hotly pursue the poor. Let them be caught in the schemes that they have devised.",
  ],
  eveningPsalms: [
    "The wicked boasts of his heart's desire. The covetous renounces Yahweh, and condemns him.",
  ],
  morningShortReading:
    "Therefore, my beloved brothers, be steadfast, immovable, always abounding in the work of the Lord, because you know that your labor is not in vain in the Lord.",
  eveningShortReading:
    "Watch and pray, that you don't enter into temptation. The spirit indeed is willing, but the flesh is weak.",
  morningCollect:
    "O God, the strength of all those who put their trust in you, mercifully accept our prayers; and because through the weakness of our mortal nature we can do no good thing without you, grant us the help of your grace; through Jesus Christ our Lord. Amen.",
  eveningCollect:
    "Be our companion, O Lord, in our paths, and let your light scatter the darkness of our hearts, that we may walk safely in the light of your countenance; through Christ our Lord. Amen.",
};

// ---- STEP 11 ----
DISCIPLINE_STEPS[10] = {
  morningPsalms: [
    "In Yahweh I take refuge. How can you say to my soul, 'Flee as a bird to your mountain!'",
    "For, behold, the wicked bend their bows. They set their arrows on the strings, that they may shoot in darkness at the upright in heart.",
  ],
  eveningPsalms: [
    "Yahweh is in his holy temple. Yahweh is on his throne in heaven. His eyes observe. His eyes examine the children of men.",
  ],
  morningShortReading:
    "Put on the whole armor of God, that you may be able to stand against the wiles of the devil.",
  eveningShortReading:
    "Peace I leave with you. My peace I give to you; not as the world gives, give I to you. Don't let your heart be troubled, neither let it be fearful.",
  morningCollect:
    "Lord of all power and might, who art the author and giver of all good things: Graft in our hearts the love of your name, increase in us true religion, and of your great mercy keep us in the same; through Jesus Christ our Lord. Amen.",
  eveningCollect:
    "O God, the protector of all who trust in you, without whom nothing is strong, nothing is holy: Increase and multiply your mercy upon us, that you being our ruler and guide, we may so pass through things temporal, that we finally lose not the things eternal; through Jesus Christ our Lord. Amen.",
};

// ---- STEP 31 ----
DISCIPLINE_STEPS[30] = {
  morningPsalms: [
    "In you, Yahweh, I take refuge. Let me never be disappointed. Deliver me in your righteousness...",
  ],
  eveningPsalms: [
    "I will bless Yahweh at all times. His praise shall continually be in my mouth...",
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
