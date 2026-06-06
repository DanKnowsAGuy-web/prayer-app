import { useState } from "react";
import { useStore } from "../lib/store";
import { rungAt } from "../lib/ladder";
import type { Tradition } from "../lib/engine";

/**
 * The assessment. It finds the lowest rung the person can keep, so the rule
 * never asks more than they can sustain. One honest question does most of the
 * work; a follow-up only appears when it changes the placement.
 */

type Answer = {
  label: string;
  meaning: string;
  rung: number;
};

/** Alphabetical, as requested. */
const TRADITIONS: { value: Tradition; label: string }[] = [
  { value: "anglican", label: "Anglican" },
  { value: "eastern-orthodox", label: "Eastern Orthodox" },
  { value: "evangelical", label: "Evangelical" },
  { value: "protestant", label: "Protestant" },
  { value: "roman-catholic", label: "Roman Catholic" },
];

const PRACTICE_ANSWERS: Answer[] = [
  {
    label: "Not yet, or only rarely",
    meaning: "We'll begin with a single short morning prayer.",
    rung: 0,
  },
  {
    label: "I pray some mornings, but it isn't settled",
    meaning: "We'll steady a short morning prayer first.",
    rung: 1,
  },
  {
    label: "I keep a steady morning prayer",
    meaning: "We'll build on your morning rule.",
    rung: 2,
  },
  {
    label: "I pray both morning and evening already",
    meaning: "We'll hold both and deepen gently over time.",
    rung: 3,
  },
];

/** A beginner's chosen starting time; each maps to a small starting rung. */
type Commitment = { minutes: number; rung: number; label: string; meaning: string };

const COMMITMENTS: Commitment[] = [
  {
    minutes: 2,
    rung: 0,
    label: "2 minutes",
    meaning: "The smallest beginning — a short prayer to anchor each morning.",
  },
  {
    minutes: 4,
    rung: 1,
    label: "4 minutes",
    meaning: "A little more — a brief prayer with a word of scripture.",
  },
  {
    minutes: 6,
    rung: 2,
    label: "6 minutes",
    meaning: "A fuller morning — prayer, the day's Gospel, and those you hold.",
  },
];

/** For those with a routine: how steady it is, used to place them honestly. */
const CONSISTENCY: { key: string; label: string }[] = [
  { key: "most", label: "Most days" },
  { key: "five", label: "About five days a week" },
  { key: "few", label: "A few days a week" },
];

/** Elements someone may already practice. Some options depend on tradition. */
function elementOptions(
  tradition: Tradition | null,
): { key: string; label: string }[] {
  const base = [
    { key: "setprayers", label: "Set or written prayers" },
    { key: "psalm", label: "A Psalm" },
    { key: "scripture", label: "Scripture reading" },
    { key: "silence", label: "Silence or stillness" },
    { key: "others", label: "Praying for others" },
  ];
  const extra: Record<string, { key: string; label: string }> = {
    "eastern-orthodox": { key: "jesusprayer", label: "The Jesus Prayer" },
    "roman-catholic": { key: "rosary", label: "The Rosary" },
    anglican: { key: "office", label: "The Daily Office" },
    evangelical: { key: "devotional", label: "A devotional or quiet time" },
    protestant: { key: "devotional", label: "A devotional or quiet time" },
  };
  return tradition && extra[tradition] ? [...base, extra[tradition]] : base;
}

export function Onboarding() {
  const { dispatch } = useStore();
  const [step, setStep] = useState<
    | "welcome"
    | "tradition"
    | "practice"
    | "framing"
    | "commitment"
    | "consistency"
    | "elements"
    | "anchor"
    | "placed"
  >("welcome");
  const [choice, setChoice] = useState<Answer | null>(null);
  const [tradition, setTradition] = useState<Tradition | null>(null);
  const [commitment, setCommitment] = useState<Commitment | null>(null);
  const [consistency, setConsistency] = useState<string | null>(null);
  const [elements, setElements] = useState<string[]>([]);
  const [anchor, setAnchor] = useState<"morning" | "evening" | null>(null);

  // Those without a settled routine get the framing + time-commitment path;
  // those with one get the routine-integration questions.
  const isBeginner = !!choice && choice.rung <= 1;
  const toggleElement = (key: string) =>
    setElements((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  if (step === "welcome") {
    return (
      <main className="app onboard">
        <p className="eyebrow">A rule of prayer</p>
        <h1 className="onboard-title">
          Begin where you are.<br />Grow as you're able.
        </h1>
        <p className="lede">
          This is a quiet companion for daily prayer. It meets you at your own
          pace and asks only what you can keep. As faithfulness grows, so does
          the prayer — never the other way around.
        </p>
        <div className="onboard-actions">
          <button className="btn btn-primary" onClick={() => setStep("tradition")}>
            Begin
          </button>
        </div>
      </main>
    );
  }

  if (step === "tradition") {
    return (
      <main className="app onboard">
        <p className="eyebrow">Where you pray from</p>
        <h2 className="onboard-q">Which tradition is your home?</h2>
        <p className="lede">
          This shapes a few touches along the way. You're always welcome,
          whatever you choose.
        </p>
        <ul className="choices">
          {TRADITIONS.map((t) => (
            <li key={t.value}>
              <button
                className={`choice ${tradition === t.value ? "is-selected" : ""}`}
                onClick={() => setTradition(t.value)}
                aria-pressed={tradition === t.value}
              >
                <span className="choice-label">{t.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="onboard-actions">
          <button
            className="btn btn-primary"
            disabled={!tradition}
            onClick={() => setStep("practice")}
          >
            Continue
          </button>
          <button className="btn btn-quiet" onClick={() => setStep("welcome")}>
            Go back
          </button>
        </div>
      </main>
    );
  }

  if (step === "practice") {
    return (
      <main className="app onboard">
        <p className="eyebrow">A few honest words</p>
        <h2 className="onboard-q">
          Do you currently pray morning and evening prayers?
        </h2>
        <p className="lede">There's no wrong answer. This only helps us start in the right place.</p>
        <ul className="choices">
          {PRACTICE_ANSWERS.map((a) => (
            <li key={a.rung}>
              <button
                className={`choice ${choice?.rung === a.rung ? "is-selected" : ""}`}
                onClick={() => setChoice(a)}
                aria-pressed={choice?.rung === a.rung}
              >
                <span className="choice-label">{a.label}</span>
                <span className="choice-meaning">{a.meaning}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="onboard-actions">
          <button
            className="btn btn-primary"
            disabled={!choice}
            onClick={() => setStep(isBeginner ? "framing" : "consistency")}
          >
            Continue
          </button>
          <button className="btn btn-quiet" onClick={() => setStep("tradition")}>
            Go back
          </button>
        </div>
      </main>
    );
  }

  if (step === "framing") {
    return (
      <main className="app onboard">
        <p className="eyebrow">How this works</p>
        <h2 className="onboard-q">Consistency before intensity</h2>
        <p className="lede">
          Over time, this companion slowly grows your prayer and scripture
          reading, working you up to about fifteen minutes in the morning and ten
          in the evening.
        </p>
        <p className="lede">
          We begin small, on purpose. It is better to pray a little every day
          than to force a long habit you'll set down after a week. We build
          consistency first, and grow from there.
        </p>
        <p className="lede">
          If you start missing days, we'll quietly pull back to make it easier.
          As you stay faithful, we'll invite you to pray a little longer.
          Adjusting as you go is completely normal.
        </p>
        <div className="onboard-actions">
          <button className="btn btn-primary" onClick={() => setStep("commitment")}>
            Continue
          </button>
          <button className="btn btn-quiet" onClick={() => setStep("practice")}>
            Go back
          </button>
        </div>
      </main>
    );
  }

  if (step === "commitment") {
    return (
      <main className="app onboard">
        <p className="eyebrow">Your starting point</p>
        <h2 className="onboard-q">How long would you like to begin with?</h2>
        <p className="lede">Just a starting point. We'll adjust together as you go.</p>
        <ul className="choices">
          {COMMITMENTS.map((c) => (
            <li key={c.minutes}>
              <button
                className={`choice ${
                  commitment?.minutes === c.minutes ? "is-selected" : ""
                }`}
                onClick={() => setCommitment(c)}
                aria-pressed={commitment?.minutes === c.minutes}
              >
                <span className="choice-label">{c.label}</span>
                <span className="choice-meaning">{c.meaning}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="onboard-actions">
          <button
            className="btn btn-primary"
            disabled={!commitment}
            onClick={() => setStep("placed")}
          >
            Continue
          </button>
          <button className="btn btn-quiet" onClick={() => setStep("framing")}>
            Go back
          </button>
        </div>
      </main>
    );
  }

  if (step === "consistency") {
    return (
      <main className="app onboard">
        <p className="eyebrow">Meeting you where you are</p>
        <h2 className="onboard-q">How steady is your routine right now?</h2>
        <p className="lede">
          This helps us start at the right depth — and keep it sustainable.
        </p>
        <ul className="choices">
          {CONSISTENCY.map((c) => (
            <li key={c.key}>
              <button
                className={`choice ${consistency === c.key ? "is-selected" : ""}`}
                onClick={() => setConsistency(c.key)}
                aria-pressed={consistency === c.key}
              >
                <span className="choice-label">{c.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="onboard-actions">
          <button
            className="btn btn-primary"
            disabled={!consistency}
            onClick={() => setStep("elements")}
          >
            Continue
          </button>
          <button className="btn btn-quiet" onClick={() => setStep("practice")}>
            Go back
          </button>
        </div>
      </main>
    );
  }

  if (step === "elements") {
    const opts = elementOptions(tradition);
    return (
      <main className="app onboard">
        <p className="eyebrow">What's already yours</p>
        <h2 className="onboard-q">What does your prayer already include?</h2>
        <p className="lede">
          Choose all that fit. We'll weave what you already do into your rule,
          rather than starting over. (Tap any that apply.)
        </p>
        <ul className="choices">
          {opts.map((o) => (
            <li key={o.key}>
              <button
                className={`choice ${elements.includes(o.key) ? "is-selected" : ""}`}
                onClick={() => toggleElement(o.key)}
                aria-pressed={elements.includes(o.key)}
              >
                <span className="choice-label">{o.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="onboard-actions">
          <button className="btn btn-primary" onClick={() => setStep("anchor")}>
            Continue
          </button>
          <button className="btn btn-quiet" onClick={() => setStep("consistency")}>
            Go back
          </button>
        </div>
      </main>
    );
  }

  if (step === "anchor") {
    return (
      <main className="app onboard">
        <p className="eyebrow">Your anchor</p>
        <h2 className="onboard-q">
          Which prayer would you never skip — morning or evening?
        </h2>
        <p className="lede">
          We'll center your Psalms and prayer list here, and protect it first if
          life gets full.
        </p>
        <ul className="choices">
          {(["morning", "evening"] as const).map((a) => (
            <li key={a}>
              <button
                className={`choice ${anchor === a ? "is-selected" : ""}`}
                onClick={() => setAnchor(a)}
                aria-pressed={anchor === a}
              >
                <span className="choice-label">
                  {a === "morning" ? "Morning" : "Evening"}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="onboard-actions">
          <button
            className="btn btn-primary"
            disabled={!anchor}
            onClick={() => setStep("placed")}
          >
            Continue
          </button>
          <button className="btn btn-quiet" onClick={() => setStep("elements")}>
            Go back
          </button>
        </div>
      </main>
    );
  }

  // placed
  const base = choice!.rung;
  const experiencedRung =
    consistency === "few" ? Math.max(1, base - 1) : base;
  const finalRung = isBeginner
    ? commitment
      ? commitment.rung
      : base
    : experiencedRung;
  const rung = rungAt(finalRung);
  const startMinutes =
    isBeginner && commitment ? commitment.minutes : rung.morning.minutes;

  const prefs = {
    scripture: elements.includes("scripture"),
    psalter: elements.includes("psalm"),
    silence: elements.includes("silence"),
    jesusPrayer: elements.includes("jesusprayer"),
    rosary: elements.includes("rosary"),
    dailyOffice: elements.includes("office"),
    devotional: elements.includes("devotional"),
  };
  const anchorTime = anchor ?? "morning";
  const integrated = [
    elements.includes("psalm") && "your Psalms",
    elements.includes("scripture") && "Scripture reading",
    elements.includes("jesusprayer") && "the Jesus Prayer",
    elements.includes("rosary") && "the Rosary",
    elements.includes("office") && "a Daily Office canticle",
    elements.includes("silence") && "a time of silence",
    elements.includes("devotional") && "personal devotion time",
    elements.includes("others") && "your prayer list",
  ].filter(Boolean) as string[];
  return (
    <main className="app onboard">
      <p className="eyebrow">Your starting place</p>
      <h2 className="onboard-q">{rung.name}</h2>
      <p className="lede">{rung.summary}</p>

      <div className="placed-card">
        <p className="placed-goal-label">Your daily goal</p>
        <p className="placed-goal">{rung.morning.goal}</p>
        {rung.evening && (
          <p className="placed-goal placed-goal-evening">
            In the evening — {rung.evening.goal}
          </p>
        )}
        <p className="placed-minutes">
          About {startMinutes} minute{startMinutes === 1 ? "" : "s"} to begin.
          We'll adjust as you go.
        </p>
        {!isBeginner && integrated.length > 0 && (
          <p className="placed-integrated">
            We'll keep {listPhrase(integrated)} in your{" "}
            {anchorTime === "evening" ? "evening" : "morning"} prayer.
          </p>
        )}
      </div>

      <div className="onboard-actions">
        <button
          className="btn btn-primary"
          onClick={() =>
            dispatch(
              isBeginner
                ? { type: "onboard", rung: finalRung, tradition }
                : {
                    type: "onboard",
                    rung: finalRung,
                    tradition,
                    prefs,
                    psalmTime: anchorTime,
                    petitionTime: anchorTime,
                  },
            )
          }
        >
          Start my rule
        </button>
        <button
          className="btn btn-quiet"
          onClick={() => setStep(isBeginner ? "commitment" : "anchor")}
        >
          Go back
        </button>
      </div>
    </main>
  );
}

/** "a, b and c" */
function listPhrase(items: string[]): string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
