import { useState } from "react";
import { useStore } from "../lib/store";
import { rungAt } from "../lib/ladder";

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

export function Onboarding() {
  const { dispatch } = useStore();
  const [step, setStep] = useState<"welcome" | "practice" | "placed">("welcome");
  const [choice, setChoice] = useState<Answer | null>(null);

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
          <button className="btn btn-primary" onClick={() => setStep("practice")}>
            Begin
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
            onClick={() => setStep("placed")}
          >
            Continue
          </button>
        </div>
      </main>
    );
  }

  // placed
  const rung = rungAt(choice!.rung);
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
          About {rung.morning.minutes} minute{rung.morning.minutes === 1 ? "" : "s"} to begin.
        </p>
      </div>

      <div className="onboard-actions">
        <button
          className="btn btn-primary"
          onClick={() => dispatch({ type: "onboard", rung: choice!.rung })}
        >
          Start my rule
        </button>
        <button className="btn btn-quiet" onClick={() => setStep("practice")}>
          Go back
        </button>
      </div>
    </main>
  );
}
