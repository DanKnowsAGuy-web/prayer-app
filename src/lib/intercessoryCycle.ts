/**
 * THE PRE-SCHISM INTERCESSORY CYCLE — content + serving rule (a usage-advanced
 * track, alongside the Psalter and the Gospel calendar). Mirrors the pattern of
 * the other content modules (psalter.ts, disciplineSteps.ts): the data and the
 * pure accessor live together.
 *
 * The reader sees only `prayer` and `attribution`. `id`, `provenance`, and
 * `revised` are internal and are never rendered.
 *
 * IMPORTANT: a prayer's historic ORIGIN (West Syriac, Byzantine, Celtic, …) is
 * NOT one of the app's five user-traditions. It appears only in the attribution
 * line. The TraditionEmblem always shows the user's own tradition — never the
 * prayer's origin. Do not map one onto the other.
 *
 * Serving rule (instruction file §4 + §5), sourced from this track's usage
 * counter (Cycle Day), not from any date.
 */

export type CycleEntry = {
  /** Stable, unique; the app keys on this, never on position. */
  id: string;
  prayer: string;
  /** Italic line shown quietly beneath the prayer. */
  attribution: string;
  /** Hidden. "sourced" = faithful manuscript rendering; "adapted" = patristic prose shaped into a prayer. */
  provenance: "sourced" | "adapted";
  /** Hidden. Whether the wording was modernized from the strict historic text. */
  revised: boolean;
};

export type CycleTheme = { name: string; pool: CycleEntry[] };

// Served once, before Day 1.
export const PROLOGUE: CycleEntry = {
  id: "PROLOGUE-DIDACHE",
  prayer:
    "We thank Thee, holy Father, for Thy holy name, which Thou hast caused to dwell in our hearts, and for the knowledge, faith, and immortality which Thou hast made known to us through Jesus Thy Servant; to Thee be the glory for ever. Thou, almighty Master, hast created all things for Thy name's sake, and hast given food and drink to all people for their gladness, that they might give Thee thanks; but to us Thou hast freely given spiritual food and drink, and life eternal, through Thy Servant. Remember, Lord, Thy Church, to deliver her from all evil and to perfect her in Thy love; and gather her together from the four winds, made holy, into Thy kingdom which Thou hast prepared for her. Let grace come, and let this world pass away. Hosanna to the God of David. If anyone is holy, let him come; if anyone is not, let him repent. Maranatha. Amen.",
  attribution: "Didache, 1st century",
  provenance: "sourced",
  revised: true,
};

// Fixed theme order (instruction file §4). Pools listed in their content order.
export const THEMES: CycleTheme[] = [
  {
    name: "The Church and Unity",
    pool: [
      {
        id: "CHURCH-WESTSYRIAC",
        prayer:
          "In peace let us beseech the Lord. For the peace that is from above, and for the salvation of our souls, let us beseech the Lord. For the peace of the whole world, and for the unity of all the holy churches of God, let us beseech the Lord. For our deliverance from all tribulation, wrath, danger, and distress, let us beseech the Lord. Lord, have mercy upon us. O good King eternal, Creator of all, receive Thy Church as she comes to Thee through Thy Christ, and gather us together within Thy holy Church, which Thou hast purchased by the precious blood of Thine only-begotten Son.",
        attribution: "Liturgy of St. James, West Syriac, 4th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "CHURCH-ALEXANDRIAN",
        prayer:
          "O Sovereign and Almighty Lord, look down from heaven upon Thy Church, upon all Thy people, and upon all Thy flock. Give us Thy peace, Thy help, and Thy love, that we may be one body and one spirit, in one faith, even as we have been called in one hope of our calling. And subdue all the enemies of Thy holy Church speedily beneath their feet. Lord, have mercy.",
        attribution: "Liturgy of St. Mark, Alexandrian, 5th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "CHURCH-ROMAN",
        prayer:
          "Grant unto Thy Church, we beseech Thee, O merciful God, that she, being gathered together by the Holy Spirit, may in no way be troubled by attack from her foes.",
        attribution: "Gelasian Sacramentary, Roman, 6th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "CHURCH-EASTSYRIAC",
        prayer:
          "Accept this offering for the whole holy universal Church, and for all the devout and righteous fathers who have been pleasing to Thee. Amen, and with us.",
        attribution: "Liturgy of Addai and Mari, East Syriac, 3rd century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "CHURCH-ARMENIAN",
        prayer:
          "For the peace of the whole world, and for the stability of the holy Church, let us beseech the Lord. For all the holy and orthodox bishops, let us beseech the Lord. Lord, have mercy.",
        attribution: "Armenian Divine Liturgy, Armenian, 5th century",
        provenance: "sourced",
        revised: false,
      },
      {
        id: "CHURCH-BYZANTINE",
        prayer:
          "In peace let us pray to the Lord. For the peace of the whole world, for the stability of the holy churches of God, and for the unity of all, let us pray to the Lord. For this holy house, and for those who enter it with faith, reverence, and the fear of God, let us pray to the Lord. Lord, have mercy. Lord our God, save Thy people and bless Thine inheritance; protect the whole body of Thy Church; sanctify those who love the beauty of Thy house, and do not forsake us who hope in Thee.",
        attribution: "Liturgy of St. John Chrysostom, Byzantine, 5th century",
        provenance: "sourced",
        revised: false,
      },
      {
        id: "CHURCH-AMBROSIAN",
        prayer:
          "Beseeching the gift of divine peace and pardon, with all our heart and with all our mind, we pray Thee. For Thy holy universal Church, which is here and is spread throughout the whole world, we pray Thee, Lord, have mercy. For the Pope and our bishop and all their clergy, and for all priests and ministers, we pray Thee, Lord, have mercy. For the peace of the churches, the calling of the nations, and the quiet of the peoples, we pray Thee, Lord, have mercy.",
        attribution: "Divinae Pacis, Ambrosian, 4th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "CHURCH-BENEDICTINE",
        prayer:
          "The superior says the Lord's Prayer in the hearing of all, that the brethren, bound by the covenant of that prayer, may be cleansed of the thorns of conflict and kept in the bond of peace: Our Father, forgive us our debts, as we also forgive our debtors. Lord, have mercy.",
        attribution: "Rule of St. Benedict, Benedictine, 6th century",
        provenance: "sourced",
        revised: false,
      },
      {
        id: "CHURCH-MOZARABIC",
        prayer:
          "Preserve in Thy peace, O Lord, those whom Thou hast redeemed by the abundant outpouring of Thy blood; keep free from every stumbling block those for whom Thou didst hang upon the tree; and make worthy, through works of charity, those whom by Thy grace Thou hast adopted as sons and daughters; that we who celebrate the victory of Thy resurrection may be set, crowned, at Thy right hand among the sheep.",
        attribution: "Mozarabic Ad Pacem, Mozarabic, 7th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "CHURCH-CELTIC",
        prayer:
          "Let us all say: Lord, hear and have mercy. With all our heart and with all our mind, O Thou who lookest upon the earth and makest it tremble, we pray. For the most high peace and the quiet of our times, and for the holy universal Church from the ends to the bounds of the whole earth, we pray. For our shepherd, the bishop, and for all bishops, priests, deacons, and all the clergy, we pray. Lord, have mercy.",
        attribution: "Stowe Missal, Celtic, 8th century",
        provenance: "sourced",
        revised: true,
      },
    ],
  },
  {
    name: "Civil Authorities and Public Peace",
    pool: [
      {
        id: "CIVIL-WESTSYRIAC",
        prayer:
          "Remember all, O Lord, for good; have mercy on all, O Sovereign Lord. Give peace to the multitudes of Thy people; remove every stumbling block; bring wars to an end; and put an end to the spread of false teaching. Grant Thy peace and Thy love to us, O God our Saviour, the hope of all the ends of the earth. Lord, have mercy upon us.",
        attribution: "Liturgy of St. James, West Syriac, 4th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "CIVIL-ALEXANDRIAN",
        prayer:
          "O God, Sovereign Lord, the Father of our Lord and Saviour Jesus Christ, grant that our ruler may enjoy peace, and be just and brave. Subdue beneath him all his adversaries and enemies; take up Thy shield and armour, and rise to his aid. Give him the victory, that his heart may be set on peace and on the praise of Thy holy name. Lord, have mercy. O King of kings and Lord of lords, defend the kingdom of Thy servant, and be kind to him for the sake of Thy holy and apostolic Church, that we too in his peaceful reign may live a calm and tranquil life, in all reverence and godliness.",
        attribution: "Liturgy of St. Mark, Alexandrian, 5th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "CIVIL-ROMAN",
        prayer:
          "Almighty and everlasting God, in whose hand are the power and the government of every realm, look down upon and help the Christian people, that the nations who trust in their own fierceness may be crushed by the power of Thine arm.",
        attribution: "Gelasian Sacramentary, Roman, 6th century",
        provenance: "sourced",
        revised: false,
      },
      {
        id: "CIVIL-ARMENIAN",
        prayer:
          "For pious and God-loving civil leaders and their armed forces, let us beseech the Lord. That the Lord may grant them to govern in peace and justice, let us beseech the Lord. Lord, have mercy.",
        attribution: "Armenian Divine Liturgy, Armenian, 5th century",
        provenance: "sourced",
        revised: false,
      },
      {
        id: "CIVIL-BYZANTINE",
        prayer:
          "For our country, for those in public service, and for all in authority, let us pray to the Lord. For favourable weather, an abundance of the fruits of the earth, and temperate seasons, let us pray to the Lord. We pray also for this country, its rulers, its people, the civil authorities, and the armed forces. Lord, have mercy.",
        attribution: "Liturgy of St. John Chrysostom, Byzantine, 5th century",
        provenance: "sourced",
        revised: false,
      },
      {
        id: "CIVIL-AMBROSIAN",
        prayer:
          "For Thy servants, our sovereign and our ruler, and for the whole of their army, we pray Thee, Lord, have mercy. For this city and its way of life, and for all who dwell in it, we pray Thee, Lord, have mercy. For seasonable weather and the fruitfulness of the lands, we pray Thee, Lord, have mercy.",
        attribution: "Divinae Pacis, Ambrosian, 4th century",
        provenance: "sourced",
        revised: false,
      },
      {
        id: "CIVIL-CELTIC",
        prayer:
          "For this place and those who dwell in it, for the most pious rulers, and for all the army, we pray. For all who are set in high authority, we pray. Lord, have mercy.",
        attribution: "Stowe Missal, Celtic, 8th century",
        provenance: "sourced",
        revised: false,
      },
    ],
  },
  {
    name: "Seekers and the World",
    pool: [
      {
        id: "SEEKERS-WESTSYRIAC",
        prayer:
          "Let none remain of the catechumens, none of the unbaptized, none of those who are unable to join with us in prayer. Look upon one another. The doors. As many as are catechumens, depart. Lord, have mercy.",
        attribution: "Liturgy of St. James, West Syriac, 4th century",
        provenance: "sourced",
        revised: false,
      },
      {
        id: "SEEKERS-ALEXANDRIAN",
        prayer:
          "O Sovereign Lord our God, who hast chosen the twelve apostles and sent them forth to proclaim throughout the whole world and to teach the Gospel of Thy kingdom: send forth now Thy light and Thy truth, that the nations may become hearers, and not hearers only but doers of Thy word, and bearing good fruit may be counted worthy of the kingdom of heaven. Lord, have mercy.",
        attribution: "Liturgy of St. Mark, Alexandrian, 5th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "SEEKERS-ROMAN",
        prayer:
          "Let us pray also for the catechumens, that our Lord and God would open the ears of their hearts, and the gate of mercy; that, having received by the font of regeneration the forgiveness of all their sins, they also may be found in Christ Jesus our Lord. Let us pray that He would deliver the world from all error, and turn the unconverted from their idols unto the living and true God. Almighty and everlasting God, who dost ever make Thy Church fruitful with new offspring, increase the faith and understanding of our catechumens, that, being born again in the font of Baptism, they may be joined to the children of Thine adoption; and gather the unconverted into Thy holy Church.",
        attribution: "Gelasian Sacramentary, Roman, 6th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "SEEKERS-BYZANTINE",
        prayer:
          "Pray, ye catechumens, to the Lord. That the Lord would have mercy on them, instruct them in the word of truth, and reveal to them the Gospel of righteousness. Ye faithful, let us pray for the catechumens, that the Lord would have mercy on them, and unite them to His holy, universal, and apostolic Church. Lord, have mercy.",
        attribution: "Liturgy of St. John Chrysostom, Byzantine, 5th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "SEEKERS-AMBROSIAN",
        prayer: "For the calling of the nations, we pray Thee. Lord, have mercy.",
        attribution: "Divinae Pacis, Ambrosian, 4th century",
        provenance: "sourced",
        revised: false,
      },
      {
        id: "SEEKERS-CELTIC",
        prayer:
          "For the catechumens, we pray. For pilgrims, and for those who seek the way of truth, we pray. Lord, have mercy.",
        attribution: "Stowe Missal, Celtic, 8th century",
        provenance: "sourced",
        revised: false,
      },
    ],
  },
  {
    name: "The Poor, Afflicted, and Captive",
    pool: [
      {
        id: "POOR-WESTSYRIAC",
        prayer:
          "For those who remember the poor, the widows and the orphans, the strangers and the needy, let us beseech the Lord. For our brethren in captivity, in exile, in prison, and in bitter slavery, and for their peaceful return, let us beseech the Lord. Lord, have mercy upon us.",
        attribution: "Liturgy of St. James, West Syriac, 4th century",
        provenance: "sourced",
        revised: false,
      },
      {
        id: "POOR-ALEXANDRIAN",
        prayer:
          "From the curse and from all that is accursed, from condemnation, imprisonment, and banishment, and from the fate that belongs to the adversary, O Lord, deliver us. Lord, have mercy. Defend, O Lord, this Christ-loving city, lowly and worthy of Thy compassion, from famine and pestilence, and from the assault of the barbarians, as Thou didst spare Nineveh of old.",
        attribution: "Liturgy of St. Mark, Alexandrian, 5th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "POOR-ROMAN",
        prayer:
          "Let us pray to our Lord God Almighty, that He would open the prisons, set free those in bondage, and grant a safe return to the wayfarers.",
        attribution: "Gelasian Sacramentary, Roman, 6th century",
        provenance: "sourced",
        revised: false,
      },
      {
        id: "POOR-CARTHAGINIAN",
        prayer:
          "For our brethren held captive, and for all the afflicted members of the one body, let us pray. The captivity of our brethren must be counted as our own captivity, and the grief of those in peril as our own grief, since we are one body in our union. In our captive brethren Christ is to be seen, and He who redeemed us from the peril of death is Himself to be ransomed from the peril of captivity. Let not love only, but faith also, move and strengthen us to redeem the members of our brethren. Deliver them, O Lord. Grant, O Lord, that each of us may do for another what he would wish done for himself, were he held captive among the barbarians; through the same Christ who redeemed us by His cross and blood.",
        attribution: "Cyprian of Carthage, 3rd century",
        provenance: "adapted",
        revised: true,
      },
      {
        id: "POOR-EASTSYRIAC",
        prayer:
          "Accept this offering for all who are in difficulty and trial, and for all the weak and the oppressed, and for all who ask a prayer from our weakness. Amen, and with us.",
        attribution: "Liturgy of Addai and Mari, East Syriac, 3rd century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "POOR-BYZANTINE",
        prayer:
          "Be mindful, O Lord, of the afflicted and the imprisoned, and of their salvation. Remember those in the mines, in exile, and in bitter bondage, and every soul in distress and need. Lord, have mercy.",
        attribution: "Liturgy of St. John Chrysostom, Byzantine, 5th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "POOR-AMBROSIAN",
        prayer:
          "For virgins, widows, orphans, captives, and those who are penitent, we pray Thee, Lord, have mercy. For those condemned to the mines, we pray Thee, Lord, have mercy.",
        attribution: "Divinae Pacis, Ambrosian, 4th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "POOR-CELTIC",
        prayer:
          "For virgins, widows, and orphans, we pray. For those who in the holy Church give the fruits of mercy, O Lord God of hosts, hear our prayers. Lord, have mercy.",
        attribution: "Stowe Missal, Celtic, 8th century",
        provenance: "sourced",
        revised: true,
      },
    ],
  },
  {
    name: "The Sick, Dying, and Travelers",
    pool: [
      {
        id: "SICK-WESTSYRIAC",
        prayer:
          "For those who are in old age and in weakness, for the sick and the suffering, and for those who are troubled by unclean spirits, that God may grant them a swift healing and salvation, let us beseech the Lord. For Christians who are sailing, traveling, or living among strangers, and for our brethren in every need, let us beseech the Lord. Lord, have mercy upon us.",
        attribution: "Liturgy of St. James, West Syriac, 4th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "SICK-ALEXANDRIAN",
        prayer:
          "Look down in mercy and compassion, O Lord, and heal the sick among Thy people. May all our brethren who have gone abroad, or who are about to go, reach their destination in safety and in good time. Lord, have mercy.",
        attribution: "Liturgy of St. Mark, Alexandrian, 5th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "SICK-ROMAN",
        prayer:
          "Let us pray that He would take away disease, grant health to the sick, and bring our seafarers to a harbour of safety.",
        attribution: "Gelasian Sacramentary, Roman, 6th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "SICK-EASTSYRIAC",
        prayer:
          "Accept this offering for all who mourn, who are in distress, and who are sick, and for all who are in difficulty and trial. Look upon Thy people according to Thy mercies, not according to our sins and our follies. Amen, and with us. O Lord our God, look upon Thy people, that they may become worthy of the forgiveness of their sins through this holy body which they receive in faith, by the grace of Thy mercy, for ever and ever.",
        attribution: "Liturgy of Addai and Mari, East Syriac, 3rd century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "SICK-BYZANTINE",
        prayer:
          "Be mindful, O Lord, of those who are at sea, of those who travel, of the sick, the afflicted, the imprisoned, and of their salvation. Lord, have mercy.",
        attribution: "Liturgy of St. John Chrysostom, Byzantine, 5th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "SICK-CELTIC",
        prayer:
          "For pilgrims, for those upon their journey, and for those who sail, we pray. For the sick and the suffering, that the Lord may grant them health and salvation, we pray. Lord, have mercy.",
        attribution: "Stowe Missal, Celtic, 8th century",
        provenance: "sourced",
        revised: false,
      },
    ],
  },
  {
    name: "Penitence and Deliverance",
    pool: [
      {
        id: "PENITENCE-WESTSYRIAC",
        prayer:
          "Truly, O Sovereign Lord, hear my supplication on behalf of Thy servants, and pass by all their errors, remembering them no more. Forgive them every transgression, whether done willingly or unwillingly, and deliver them from everlasting punishment. Lord, have mercy upon us.",
        attribution: "Liturgy of St. James, West Syriac, 4th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "PENITENCE-ALEXANDRIAN",
        prayer:
          "Whatever sin we have committed in thought, word, or deed, do Thou in Thy goodness and mercy be pleased to pardon. Leave us not, O Lord, while we hope in Thee, nor lead us into temptation, but deliver us from the evil one and from his works. Lord, have mercy.",
        attribution: "Liturgy of St. Mark, Alexandrian, 5th century",
        provenance: "sourced",
        revised: false,
      },
      {
        id: "PENITENCE-ROMAN",
        prayer:
          "O God, who art offended by sin and pacified by penance, mercifully regard the prayers of Thy people who make their supplication to Thee, and turn away the afflictions of Thine anger which we deserve for our sins.",
        attribution: "Gelasian Sacramentary, Roman, 6th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "PENITENCE-CARTHAGINIAN",
        prayer:
          "For the fallen and the wounded brother, let us pray. Let us mourn with those who mourn, and weep with those who weep, and raise them up by the help and comfort of our love. As priests of God and of Christ, let us imitate what Christ taught and did, and snatch the wounded brother from the jaws of the enemy, that he may be kept and healed for God. Spare them, O Lord.",
        attribution: "Cyprian of Carthage, 3rd century",
        provenance: "adapted",
        revised: true,
      },
      {
        id: "PENITENCE-EASTSYRIAC",
        prayer:
          "Look upon Thy people according to Thy mercies and the abundance of Thy favours, not according to our sins and our follies. Pardon the debts and the sins of all Thy servants. Amen, and with us.",
        attribution: "Liturgy of Addai and Mari, East Syriac, 3rd century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "PENITENCE-ARMENIAN",
        prayer:
          "That this offering in which we share may be not for our condemnation, but for the atoning and the forgiveness of our sins. Have mercy upon us, O Lord our God, according to Thy great mercy. Lord, have mercy. Accept the prayers of us Thy servants, and be merciful to us according to Thy great mercy, for the atoning and the forgiveness of our sins.",
        attribution: "Armenian Divine Liturgy, Armenian, 5th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "PENITENCE-BYZANTINE",
        prayer:
          "That these holy gifts may be, to those who partake, for the cleansing of the soul, for the forgiveness of sins, and for the communion of the Holy Spirit, and not for judgment or condemnation. Lord, have mercy.",
        attribution: "Liturgy of St. John Chrysostom, Byzantine, 5th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "PENITENCE-AMBROSIAN",
        prayer:
          "For those who are penitent, we pray Thee, Lord, have mercy. Beseeching the gift of pardon, with all our heart and with all our mind, we pray Thee, Lord, have mercy.",
        attribution: "Divinae Pacis, Ambrosian, 4th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "PENITENCE-GALLICAN",
        prayer:
          "Sanctify, O Lord, the gifts here offered, and cleanse us from the stains of our sins.",
        attribution: "Bobbio Missal, Gallican, 7th century",
        provenance: "sourced",
        revised: false,
      },
      {
        id: "PENITENCE-BENEDICTINE",
        prayer:
          "Lord, have mercy. Christ, have mercy. Lord, have mercy. Deliver us, O Lord, from all evil, and lead us not into temptation.",
        attribution: "Rule of St. Benedict, Benedictine, 6th century",
        provenance: "sourced",
        revised: false,
      },
      {
        id: "PENITENCE-MOZARABIC",
        prayer:
          "We beseech Thy pardon, O Christ: hear us. Have mercy, have mercy upon Thy people, O God. Pardon. Lord, have mercy.",
        attribution: "Mozarabic Preces, Mozarabic, 7th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "PENITENCE-CELTIC",
        prayer:
          "For those who are penitent, we pray. That the Lord may grant them pardon and amendment of life, we pray. Lord, have mercy. We repeat our prayer before the sight of Thy majesty, O almighty God, which we offer for Thy servants, that Thou mayest fulfil their vows, and that their petitions may rise to the ears of Thy mercy.",
        attribution: "Stowe Missal, Celtic, 8th century",
        provenance: "sourced",
        revised: true,
      },
    ],
  },
  {
    name: "Saints and the Departed",
    pool: [
      {
        id: "SAINTS-WESTSYRIAC",
        prayer:
          "For the rest of our fathers and brethren who have fallen asleep before us, let us beseech the Lord. Let us commemorate our all-holy, pure, and most glorious Lady, the God-bearer and ever-virgin Mary, and all the holy and the just, that we may all find mercy through their prayers and intercessions. Lord, have mercy upon us. Remember, O Lord, the souls of our fathers, our brethren, our teachers, and our departed, the children of Thy holy Church; grant rest to their souls and spirits, and sprinkle the dew of Thy grace and mercy upon their bones.",
        attribution: "Liturgy of St. James, West Syriac, 4th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "SAINTS-ALEXANDRIAN",
        prayer:
          "O Lord our God, give peace to the souls of our fathers and brethren who have fallen asleep in Jesus, remembering our forefathers of old: the patriarchs, prophets, apostles, and martyrs. Lord, have mercy.",
        attribution: "Liturgy of St. Mark, Alexandrian, 5th century",
        provenance: "sourced",
        revised: false,
      },
      {
        id: "SAINTS-ROMAN",
        prayer:
          "Remember also, O Lord, Thy servants who have gone before us marked by baptism, and who sleep the sleep of peace. To these, O Lord, and to all who rest in Christ, grant, we beseech Thee, a place of rest, light, and peace; through Christ our Lord. Amen.",
        attribution: "Roman Canon, Roman, 6th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "SAINTS-EASTSYRIAC",
        prayer:
          "For all the prophets and apostles, and for all the martyrs and those who suffered for the faith, and for all the dead who have gone from among us, that they may find pardon and rest. Amen, and with us.",
        attribution: "Liturgy of Addai and Mari, East Syriac, 3rd century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "SAINTS-ARMENIAN",
        prayer:
          "Remembering the God-bearer and ever-virgin Mary together with all the saints, let us beseech the Lord. For the souls of those who are at rest and have fallen asleep in Christ in the true faith, be mindful, O Lord, and have mercy. Lord, have mercy.",
        attribution: "Armenian Divine Liturgy, Armenian, 5th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "SAINTS-BYZANTINE",
        prayer:
          "Again we offer this spiritual worship for those who rest in faith: for forefathers, fathers, patriarchs, prophets, apostles, martyrs, and those who suffered for the faith, and for every righteous spirit made perfect in faith. Especially for our most holy and pure Lady, the God-bearer and ever-virgin Mary, and for all the saints, through whose intercessions look down upon us, O God. Be mindful, O Lord, and have mercy. Remember all who sleep in the hope of the resurrection to eternal life, and grant them rest in that place where the light of Thy countenance shines upon them.",
        attribution: "Liturgy of St. John Chrysostom, Byzantine, 5th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "SAINTS-RAVENNA",
        prayer:
          "Let us honour the holy and ever-virgin Mary, the God-bearer, through whose child-bearing the salvation of the world has shone forth. Through her intercession, O Lord, look upon Thy people. Lord, have mercy.",
        attribution: "Rotulus of Ravenna, 5th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "SAINTS-MOZARABIC",
        prayer:
          "We commemorate the apostles and martyrs: holy Mary, Zechariah, John the Baptist, the Holy Innocents killed by Herod, and the apostles; and of all the martyrs. We commemorate the spirits of those at rest: Hilary, Athanasius, Martin, Ambrose, Augustine, and the fathers of Toledo; and of all who rest. For Thou art the life of the living, the health of the sick, and the rest of all the faithful departed, unto eternal ages of ages.",
        attribution: "Mozarabic, 7th century",
        provenance: "sourced",
        revised: true,
      },
      {
        id: "SAINTS-CELTIC",
        prayer:
          "Let us be mindful of the holy apostles and martyrs, that by their prayers for us we may receive pardon. And of all who rest, that the Lord may grant them light and peace, we pray. O God, who grantest us to grow by imitating Thy most blessed saints, the angels and archangels, the patriarchs, prophets, apostles, martyrs, those who suffered for the faith, virgins, solitary hermits, and community monks, defend us from all dangers by their intercession; through Christ.",
        attribution: "Stowe Missal, Celtic, 8th century",
        provenance: "sourced",
        revised: true,
      },
    ],
  },
];

/**
 * The serving rule (instruction file §4 + §5), exact and stateless. `day` is the
 * Cycle Day (1 onward), sourced from this track's usage counter — never a date.
 *
 *   t = ((D-1) mod 7) + 1            theme for the day
 *   p = floor((D-1) / 7)            passes the theme has had
 *   o = (t-1) mod poolSize[t]       staggered start (§5)
 *   i = (o + p) mod poolSize[t]     entry index (0-based)
 */
export function serveCycleDay(day: number): { theme: string; entry: CycleEntry } {
  const D = Math.max(1, Math.floor(day));
  const t = ((D - 1) % 7) + 1; // 1..7
  const theme = THEMES[t - 1];
  const size = theme.pool.length;
  const p = Math.floor((D - 1) / 7);
  const o = (t - 1) % size;
  const i = (o + p) % size;
  return { theme: theme.name, entry: theme.pool[i] };
}

/** The Prologue, served once before Day 1. */
export function prologueEntry(): CycleEntry {
  return PROLOGUE;
}
