/**
 * TRACK B — the date-anchored Gospel calendar (LITURGY_CALENDAR).
 * A flat 'MM-DD' lookup of the morning and evening Gospel for the day.
 * Modern WEB translation; the divine name is "Yahweh" where it appears.
 *
 * Populated so far: January 1–10 (full), January 11 (morning only — its evening
 * text was truncated in the source). All other dates fall back to the bundled
 * daily lectionary until supplied. Keys are 'MM-DD', year-independent.
 */

export type GospelReading = { ref: string; text: string };
export type CalendarEntry = { morning?: GospelReading; evening?: GospelReading };

export const CALENDAR_GOSPELS: Record<string, CalendarEntry> = {
  "01-01": {
    morning: {
      ref: "John 1:1-14",
      text: "In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made through him. Without him was not anything made that has been made. In him was life, and the life was the light of men. The light shines in the darkness, and the darkness hasn't overcome it. There came a man, sent from God, whose name was John. The same came as a witness, that he might testify about the light, that all might believe through him. He was not the light, but was sent that he might testify about the light.",
    },
    evening: {
      ref: "John 1:1-14",
      text: "The true light that enlightens everyone was coming into the world. He was in the world, and the world was made through him, and the world didn't recognize him. He came to his own, and those who were his own didn't receive him. But as many as received him, to them he gave the right to become God's children, to those who believe in his name: who were born, not of blood, nor of the will of the flesh, nor of the will of man, but of God. The Word became flesh, and lived among us. We saw his glory, such glory as of the one and only Son of the Father, full of grace and truth.",
    },
  },
  "01-02": {
    morning: {
      ref: "John 1:15-28",
      text: "John testified about him. He cried out, saying, 'This was he of whom I said, \"He who comes after me has surpassed me, for he was before me.\"' From his fullness we all received grace upon grace. For the law was given through Moses. Grace and truth came through Jesus Christ. No one has seen God at any time. The one and only Son, who is in the bosom of the Father, he has declared him. This is John's testimony, when the Jews sent priests and Levites from Jerusalem to ask him, 'Who are you?' He declared, and didn't deny, but he declared, 'I am not the Christ.'",
    },
    evening: {
      ref: "John 1:15-28",
      text: "They asked him, 'What then? Are you Elijah?' He said, 'I am not.' 'Are you the prophet?' He answered, 'No.' They said therefore to him, 'Who are you? Give us an answer to take back to those who sent us. What do you say about yourself?' He said, 'I am the voice of one crying in the wilderness, \"Make straight the way of Yahweh,\" as Isaiah the prophet said.' Those who had been sent were from the Pharisees. They asked him, 'Why then do you baptize, if you are not the Christ, nor Elijah, nor the prophet?' John answered them, 'I baptize in water, but among you stands one whom you don't know. He is the one who comes after me, who is preferred before me, whose sandal strap I'm not worthy to untie.' These things were done in Bethany beyond the Jordan, where John was baptizing.",
    },
  },
  "01-03": {
    morning: {
      ref: "John 1:29-42",
      text: "The next day, he saw Jesus coming to him, and said, 'Behold, the Lamb of God, who takes away the sin of the world! This is he of whom I said, \"After me comes a man who is preferred before me, for he was before me.\" I didn't know him, but for this reason I came baptizing in water: that he would be revealed to Israel.' John testified, saying, 'I have seen the Spirit descending like a dove out of heaven, and it remained on him. I didn't know him, but he who sent me to baptize in water said to me, \"On whomever you will see the Spirit descending, and remaining on him, the same is he who baptizes in the Holy Spirit.\" I have seen, and have testified that this is the Son of God.'",
    },
    evening: {
      ref: "John 1:29-42",
      text: "Again, the next day, John was standing with two of his disciples, and he looked at Jesus as he walked, and said, 'Behold, the Lamb of God!' The two disciples heard him speak, and they followed Jesus. Jesus turned, and saw them following, and said to them, 'What are you seeking?' They said to him, 'Rabbi' (which being interpreted means Teacher), 'where are you staying?' He said to them, 'Come, and see.' They came and saw where he was staying, and they stayed with him that day. It was about the tenth hour. One of the two who heard John, and followed him, was Andrew, Simon Peter's brother. He first found his own brother, Simon, and said to him, 'We have found the Messiah' (which is, being interpreted, Christ). He brought him to Jesus. Jesus looked at him, and said, 'You are Simon the son of Jonah. You shall be called Cephas' (which is by interpretation, A stone).",
    },
  },
  "01-04": {
    morning: {
      ref: "John 1:43-51",
      text: "On the next day, he was determined to go out into Galilee, and he found Philip. Jesus said to him, 'Follow me.' Now Philip was from Bethsaida, of the city of Andrew and Peter. Philip found Nathanael, and said to him, 'We have found him of whom Moses in the law, and the prophets, wrote: Jesus of Nazareth, the son of Joseph.' Nathanael said to him, 'Can any good thing come out of Nazareth?' Philip said to him, 'Come and see.'",
    },
    evening: {
      ref: "John 1:43-51",
      text: "Jesus saw Nathanael coming to him, and said of him, 'Behold, an Israelite indeed, in whom is no deceit!' Nathanael said to him, 'How do you know me?' Jesus answered him, 'Before Philip called you, when you were under the fig tree, I saw you.' Nathanael answered him, 'Rabbi, you are the Son of God! You are the King of Israel!' Jesus answered him, 'Because I told you, \"I saw you under the fig tree,\" do you believe? You will see greater things than these.' He said to him, 'Most certainly, I tell you, hereafter you will see heaven opened, and the angels of God ascending and descending on the Son of Man.'",
    },
  },
  "01-05": {
    morning: {
      ref: "John 2:1-12",
      text: "The third day, there was a marriage in Cana of Galilee, and the mother of Jesus was there. Jesus also was invited, with his disciples, to the marriage. When the wine ran out, the mother of Jesus said to him, 'They have no wine.' Jesus said to her, 'Woman, what does that have to do with us? My hour has not yet come.' His mother said to the servants, 'Whatever he says to you, do it.' Now there were six water pots of stone set there after the Jews' way of purifying, containing two or three metretas apiece.",
    },
    evening: {
      ref: "John 2:1-12",
      text: "Jesus said to them, 'Fill the water pots with water.' They filled them up to the brim. He said to them, 'Now draw some out, and take it to the ruler of the feast.' So they took it. When the ruler of the feast tasted the water now become wine, and didn't know where it came from (but the servants who had drawn the water knew), the ruler of the feast called the bridegroom, and said to him, 'Everyone serves the good wine first, and when the guests have drunk freely, then that which is worse. You have kept the good wine until now!' This beginning of signs Jesus did in Cana of Galilee, and revealed his glory; and his disciples believed in him. After this he went down to Capernaum, he, and his mother, his brothers, and his disciples; and they stayed there a few days.",
    },
  },
  "01-06": {
    morning: {
      ref: "John 2:13-25",
      text: "The Passover of the Jews was at hand, and Jesus went up to Jerusalem. He found in the temple those who sold oxen and sheep and doves, and the changers of money sitting. He made a scourge of cords, and drove them all out of the temple, both the sheep and the oxen; and he poured out the changers' money, and overthrew their tables. To those who sold the doves he said, 'Take these things out of here! Don't make my Father's house a marketplace!' His disciples remembered that it was written, 'Zeal for your house will eat me up.'",
    },
    evening: {
      ref: "John 2:13-25",
      text: "The Jews therefore answered him, 'What sign do you show us, seeing that you do these things?' Jesus answered them, 'Destroy this temple, and in three days I will raise it up.' The Jews therefore said, 'Forty-six years was this temple in building, and will you raise it up in three days?' But he spoke of the temple of his body. When therefore he was raised from the dead, his disciples remembered that he said this, and they believed the Scripture, and the word which Jesus had said. Now when he was in Jerusalem at the Passover, during the feast, many believed in his name, observing his signs which he did. But Jesus didn't trust himself to them, because he knew all men, and because he didn't need for anyone to testify concerning man; for he himself knew what was in man.",
    },
  },
  "01-07": {
    morning: {
      ref: "John 3:1-13",
      text: "Now there was a man of the Pharisees, named Nicodemus, a ruler of the Jews. The same came to him by night, and said to him, 'Rabbi, we know that you are a teacher come from God, for no one can do these signs that you do, unless God is with him.' Jesus answered him, 'Most certainly, I tell you, unless one is born anew, he can't see God's kingdom.' Nicodemus said to him, 'How can a man be born when he is old? Can he enter a second time into his mother's womb, and be born?'",
    },
    evening: {
      ref: "John 3:1-13",
      text: "Jesus answered, 'Most certainly, I tell you, unless one is born of water and the Spirit, he can't enter into God's kingdom! That which is born of the flesh is flesh, and that which is born of the Spirit is spirit. Don't marvel that I said to you, \"You must be born anew.\" The wind blows where it wants to, and you hear its sound, but don't know where it comes from and where it goes. So is everyone who is born of the Spirit.' Nicodemus answered him, 'How can these things be?' Jesus answered him, 'Are you the teacher of Israel, and don't understand these things? Most certainly, I tell you, we speak that which we know, and testify of that which we have seen, and you don't receive our witness. If I told you earthly things and you don't believe, how will you believe if I tell you heavenly things? No one has ascended into heaven, but he who descended out of heaven, the Son of Man, who is in heaven.'",
    },
  },
  "01-08": {
    morning: {
      ref: "John 3:14-21",
      text: "As Moses lifted up the serpent in the wilderness, even so must the Son of Man be lifted up, that whoever believes in him should not perish, but have eternal life. For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life. For God didn't send his Son into the world to judge the world, but that the world should be saved through him.",
    },
    evening: {
      ref: "John 3:14-21",
      text: "He who believes in him is not judged. He who doesn't believe has been judged already, because he has not believed in the name of the one and only Son of God. This is the judgment, that the light has come into the world, and men loved the darkness rather than the light; for their works were evil. For everyone who does evil hates the light, and doesn't come to the light, lest his works would be exposed. But he who does the truth comes to the light, that his works may be revealed, that they have been done in God.",
    },
  },
  "01-09": {
    morning: {
      ref: "John 3:22-36",
      text: "After these things, Jesus came with his disciples into the land of Judea. He stayed there with them, and baptized. John also was baptizing in Enon near Salim, because there was much water there. They came, and were baptized. For John was not yet thrown into prison. There arose therefore a questioning on the part of John's disciples with some Jews about purification. They came to John, and said to him, 'Rabbi, he who was with you beyond the Jordan, to whom you have testified, behold, the same baptizes, and everyone is coming to him.' John answered, 'A man can receive nothing, unless it has been given him from heaven.'",
    },
    evening: {
      ref: "John 3:22-36",
      text: "You yourselves bear me witness that I said, 'I am not the Christ,' but, 'I have been sent before him.' He who has the bride is the bridegroom; but the friend of the bridegroom, who stands and hears him, rejoices greatly because of the bridegroom's voice. This my joy therefore is made full. He must increase, but I must decrease. He who comes from above is above all. He who is from the earth belongs to the earth, and speaks of the earth. He who comes from heaven is above all. What he has seen and heard, of that he testifies; and no one receives his witness. He who has received his witness has set his seal to this, that God is true. For he whom God has sent speaks the words of God; for God gives the Spirit without measure. The Father loves the Son, and has given all things into his hand. He who believes in the Son has eternal life, but he who disobeys the Son won't see life, but the wrath of God remains on him.",
    },
  },
  "01-10": {
    morning: {
      ref: "John 4:1-15",
      text: "Therefore when the Lord knew that the Pharisees had heard that Jesus was making and baptizing more disciples than John (although Jesus himself didn't baptize, but his disciples), he left Judea, and departed again into Galilee. He needed to pass through Samaria. So he came to a city of Samaria, called Sychar, near the parcel of ground that Jacob gave to his son Joseph. Jacob's well was there. Jesus therefore, being wearied with his journey, sat down by the well. It was about the sixth hour. A woman of Samaria came to draw water. Jesus said to her, 'Give me a drink.' For his disciples had gone away into the city to buy food.",
    },
    evening: {
      ref: "John 4:1-15",
      text: "The Samaritan woman therefore said to him, 'How is it that you, being a Jew, ask for a drink from me, a Samaritan woman?' (For Jews have no dealings with Samaritans.) Jesus answered her, 'If you knew the gift of God, and who it is that says to you, \"Give me a drink,\" you would have asked of him, and he would have given you living water.' The woman said to him, 'Sir, you have nothing to draw with, and the well is deep. From where then do you have that living water? Are you greater than our father Jacob, who gave us the well, and drank of it himself, as did his children and his livestock?' Jesus answered her, 'Everyone who drinks of this water will thirst again, but whoever drinks of the water that I will give him will never thirst no more; but the water that I will give him will become in him a well of water springing up to eternal life.' The woman said to him, 'Sir, give me this water, that I don't thirst, neither come all the way here to draw.'",
    },
  },
  "01-11": {
    // Morning only — the source's evening text was truncated mid-sentence.
    morning: {
      ref: "John 4:16-30",
      text: "Jesus said to her, 'Go, call your husband, and come here.' The woman answered, 'I have no husband.' Jesus said to her, 'You said well, \"I have no husband,\" for you have had five husbands; and he whom you now have is not your husband. This you have said truly.' The woman said to him, 'Sir, I perceive that you are a prophet. Our fathers worshiped in this mountain, and you say that in Jerusalem is the place where people ought to worship.'",
    },
  },

  // --- Earlier sample dates (truncated placeholders, pending real data) ---
  "06-06": {
    morning: {
      ref: "John 5:24–27",
      text: "He who hears my word, and believes him who sent me, has eternal life...",
    },
    evening: {
      ref: "John 5:28–30",
      text: "Don't marvel at this, for the hour comes in which all that are in the tombs will hear his voice...",
    },
  },
  "07-01": {
    morning: {
      ref: "Matthew 5:1–12",
      text: "Seeing the multitudes, he went up onto the mountain. When he had sat down, his disciples came to him...",
    },
    evening: {
      ref: "Matthew 5:13–16",
      text: "You are the salt of the earth, but if the salt has lost its flavor, with what will it be salted?...",
    },
  },
  "12-25": {
    morning: {
      ref: "Luke 2:1–14",
      text: "Now it happened in those days, that a decree went out from Caesar Augustus...",
    },
    evening: {
      ref: "John 1:14–18",
      text: "The Word became flesh, and lived among us...",
    },
  },
};

/** 'YYYY-MM-DD' → 'MM-DD'. */
export function mmddOf(date: string): string {
  return date.slice(5);
}

/** The Gospel for a date's part, or undefined if that date isn't in the matrix. */
export function calendarGospel(
  date: string,
  part: "morning" | "evening",
): GospelReading | undefined {
  return CALENDAR_GOSPELS[mmddOf(date)]?.[part];
}
