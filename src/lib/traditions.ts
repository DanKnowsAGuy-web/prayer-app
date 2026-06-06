/**
 * Per-tradition customizations, chosen at first launch (see Onboarding).
 * Everything here is editable text — adjust wording to your tradition freely.
 *
 *  - opening: a short prayer that begins the office
 *  - intercessionClose: the closing said after the names in the prayer list
 *
 * The visual emblem lives in components/TraditionEmblem.tsx.
 */
import type { Tradition } from "./engine";

type TraditionMeta = {
  name: string;
  opening: { label: string; text: string };
  intercessionClose: string;
};

// Closings shared by more than one tradition.
const CLOSE_SAINTS =
  "Lord, as You will and as You know, have mercy on us and save us, for You are good and love mankind.\n\nThrough the prayers of the holy fathers and holy mothers and all the saints who have gone before us, have mercy on us and save us.\n\nIn the name of the Father, and the Son, and the Holy Spirit. Amen.";

const CLOSE_MEDIATOR =
  "Lord, as You will and as You know, have mercy on us and save us. Receive these prayers for the sake of Jesus Christ, our only Mediator and Advocate; in the name of the Father, and the Son, and the Holy Spirit. Amen.";

const CLOSE_REFORMED =
  "Lord, as You will and as You know, have mercy on us and save us. We ask it all in the name of Jesus Christ, our Lord and only Mediator, trusting in Your steadfast love. Amen.";

export const TRADITION_META: Record<Tradition, TraditionMeta> = {
  anglican: {
    name: "Anglican",
    opening: {
      label: "A Collect for Purity",
      text: "Almighty God, unto whom all hearts are open, all desires known, and from whom no secrets are hid: cleanse the thoughts of our hearts by the inspiration of thy Holy Spirit, that we may perfectly love thee, and worthily magnify thy holy Name; through Christ our Lord. Amen.",
    },
    intercessionClose: CLOSE_MEDIATOR,
  },
  "eastern-orthodox": {
    name: "Eastern Orthodox",
    opening: {
      label: "O Heavenly King",
      // OCA-typical English.
      text: "O Heavenly King, the Comforter, the Spirit of Truth, who art everywhere present and fillest all things, Treasury of good things and Giver of life: come and abide in us, and cleanse us from every impurity, and save our souls, O Good One.",
    },
    intercessionClose: CLOSE_SAINTS,
  },
  evangelical: {
    name: "Evangelical",
    opening: {
      label: "Coming to God",
      text: "Be still, and know that I am God. (Psalm 46:10)\n\nLord, I come to You now. Quiet my heart, open Your Word to me, and meet me here. In Jesus' name. Amen.",
    },
    intercessionClose: CLOSE_REFORMED,
  },
  protestant: {
    name: "Protestant",
    opening: {
      label: "Invocation",
      text: "Almighty God, you are worthy of all praise. Open my lips and my heart to worship you in spirit and in truth; through Jesus Christ my Lord. Amen.",
    },
    intercessionClose: CLOSE_REFORMED,
  },
  "roman-catholic": {
    name: "Roman Catholic",
    opening: {
      label: "The Sign of the Cross",
      text: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.\n\nO God, come to my assistance.\nO Lord, make haste to help me.",
    },
    intercessionClose: CLOSE_SAINTS,
  },
};
