import { useState } from "react";
import { useStore, makeId } from "../lib/store";
import { LAST_RUNG } from "../lib/ladder";
import type { Tradition } from "../lib/engine";
import { buildReminderIcs, downloadIcs } from "../lib/ics";
import { IS_EO } from "../lib/flavor";

/**
 * Onboarding sets the two things that actually shape the prayer — the
 * tradition and the scripture translation — then explains how the daily prayer
 * works: one prayer, sized to the day by a slider, with a few streams of prayer
 * rotating through. Everyone begins with the full system available; the slider,
 * not a ladder, is the daily adaptation.
 */

/** Alphabetical, as requested. */
const TRADITIONS: { value: Tradition; label: string }[] = [
  { value: "anglican", label: "Anglican" },
  { value: "eastern-orthodox", label: "Eastern Orthodox" },
  { value: "evangelical", label: "Evangelical" },
  { value: "protestant", label: "Protestant" },
  { value: "roman-catholic", label: "Roman Catholic" },
];

type Step =
  | "welcome"
  | "tradition"
  | "translation"
  | "names"
  | "reminder"
  | "how"
  | "rotation"
  | "start";

export function Onboarding() {
  const { dispatch, today } = useStore();
  const [step, setStep] = useState<Step>("welcome");
  // The EO edition is Eastern Orthodox from the first breath — no choosing.
  const [tradition, setTradition] = useState<Tradition | null>(
    IS_EO ? "eastern-orthodox" : null,
  );
  const [translation, setTranslation] = useState<"web" | "kjv" | "msb">(
    IS_EO ? "msb" : "web",
  );
  const [names, setNames] = useState<{ text: string; cadence: "daily" | "weekly" }[]>([]);
  const [nameInput, setNameInput] = useState("");
  const [remMorning, setRemMorning] = useState<string | null>(null);
  const [remEvening, setRemEvening] = useState<string | null>(null);

  /** Persist any chosen reminder times (the existing reminders state). */
  const commitReminders = () => {
    dispatch({ type: "setReminder", slot: "morning", time: remMorning });
    dispatch({ type: "setReminder", slot: "evening", time: remEvening });
  };

  const addName = (cadence: "daily" | "weekly") => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setNames((prev) => [...prev, { text: trimmed, cadence }]);
    setNameInput("");
  };

  const traditionName =
    TRADITIONS.find((t) => t.value === tradition)?.label ?? "your";

  if (step === "welcome") {
    return (
      <main className="app onboard">
        <p className="eyebrow">A rule of prayer</p>
        <h1 className="onboard-title">
          Begin where you are.<br />Grow as you're able.
        </h1>
        <p className="lede">
          This is a quiet companion for daily prayer, and meets you at your own
          pace.
        </p>
        <div className="onboard-actions">
          <button
            className="btn btn-primary"
            onClick={() => setStep(IS_EO ? "translation" : "tradition")}
          >
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
            onClick={() => setStep("translation")}
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

  if (step === "translation") {
    const options: { value: "web" | "kjv" | "msb"; label: string; meaning: string }[] = ([
      {
        value: "web",
        label: "World English Bible",
        meaning: "Modern English, clear and plain. (Public domain.)",
      },
      {
        value: "kjv",
        label: "King James Version",
        meaning: "Traditional English, familiar and stately. (Public domain.)",
      },
      {
        value: "msb",
        label: "MSB (Majority Standard Bible)",
        meaning: "Modern English; its New Testament follows the Byzantine Majority Text. (Public domain.)",
      },
    ] as { value: "web" | "kjv" | "msb"; label: string; meaning: string }[]).filter(
      (o) => !IS_EO || o.value !== "web",
    );
    return (
      <main className="app onboard">
        <p className="eyebrow">How scripture reads</p>
        <h2 className="onboard-q">Which translation would you like?</h2>
        <p className="lede">
          The readings are the same either way — only the wording changes. You
          can switch any time in settings.
        </p>
        <ul className="choices">
          {options.map((o) => (
            <li key={o.value}>
              <button
                className={`choice ${translation === o.value ? "is-selected" : ""}`}
                onClick={() => setTranslation(o.value)}
                aria-pressed={translation === o.value}
              >
                <span className="choice-label">{o.label}</span>
                <span className="choice-meaning">{o.meaning}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="onboard-actions">
          <button className="btn btn-primary" onClick={() => setStep("names")}>
            Continue
          </button>
          <button
            className="btn btn-quiet"
            onClick={() => setStep(IS_EO ? "welcome" : "tradition")}
          >
            Go back
          </button>
        </div>
      </main>
    );
  }

  if (step === "names") {
    return (
      <main className="app onboard">
        <p className="eyebrow">Those you carry</p>
        <h2 className="onboard-q">Anyone to hold in prayer?</h2>
        <p className="lede">
          Add any names you'd like to pray for each day — or skip this; you can
          add or change people any time from your prayer list.
        </p>
        <form
          className="intention-add"
          onSubmit={(e) => {
            e.preventDefault();
            addName("daily");
          }}
        >
          <input
            className="intention-input"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="A name…"
            aria-label="A name to pray for"
            maxLength={120}
          />
          <div className="intention-add-btns">
            <button className="btn btn-ghost" type="submit" disabled={!nameInput.trim()}>
              Add daily
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => addName("weekly")}
              disabled={!nameInput.trim()}
            >
              Add weekly
            </button>
          </div>
        </form>
        {names.length > 0 && (
          <ul className="name-chips">
            {names.map((n, i) => (
              <li key={i} className="name-chip">
                <span>
                  {n.text}
                  {n.cadence === "weekly" && (
                    <span className="name-chip-cadence"> · weekly</span>
                  )}
                </span>
                <button
                  className="name-chip-x"
                  aria-label={`Remove ${n.text}`}
                  onClick={() => setNames((prev) => prev.filter((_, k) => k !== i))}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="onboard-actions">
          <button className="btn btn-primary" onClick={() => setStep("reminder")}>
            {names.length > 0 ? "Continue" : "Skip for now"}
          </button>
          <button className="btn btn-quiet" onClick={() => setStep("translation")}>
            Go back
          </button>
        </div>
      </main>
    );
  }

  if (step === "reminder") {
    const anySet = remMorning !== null || remEvening !== null;
    const row = (
      label: string,
      value: string | null,
      fallback: string,
      set: (t: string | null) => void,
    ) => (
      <div className="reminder-row">
        <span className="toggle-label">{label}</span>
        <div className="reminder-controls">
          {value !== null && (
            <input
              className="intention-input reminder-time"
              type="time"
              value={value}
              onChange={(e) => set(e.target.value)}
              aria-label={`${label} time`}
            />
          )}
          <button
            className={`switch ${value !== null ? "is-on" : ""}`}
            role="switch"
            aria-checked={value !== null}
            aria-label={`${label} reminder ${value !== null ? "on" : "off"}`}
            onClick={() => set(value !== null ? null : fallback)}
          >
            <span className="switch-knob" />
          </button>
        </div>
      </div>
    );
    return (
      <main className="app onboard">
        <p className="eyebrow">A daily nudge</p>
        <h2 className="onboard-q">Would a reminder help?</h2>
        <p className="lede">
          Set a time for morning or evening prayer and add it to your phone's
          calendar — it will remind you each day, even with the app closed. If
          you skip this, you can set it any time in Settings.
        </p>
        {row("Morning prayer", remMorning, "07:00", setRemMorning)}
        {row("Evening prayer", remEvening, "20:00", setRemEvening)}
        {anySet && (
          <button
            className="btn btn-ghost see-list"
            onClick={() =>
              downloadIcs(
                "prayer-reminders.ics",
                buildReminderIcs({ morning: remMorning, evening: remEvening }),
              )
            }
          >
            Add to my phone's calendar
          </button>
        )}
        <div className="onboard-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              commitReminders();
              setStep("how");
            }}
          >
            {anySet ? "Continue" : "Skip for now"}
          </button>
          <button className="btn btn-quiet" onClick={() => setStep("names")}>
            Go back
          </button>
        </div>
      </main>
    );
  }

  if (step === "how") {
    return (
      <main className="app onboard">
        <p className="eyebrow">How this works</p>
        <h2 className="onboard-q">One prayer, sized to your day</h2>
        <p className="lede">
          Each prayer is built full — around fifteen unhurried minutes. But no
          two days are the same.
        </p>
        <p className="lede">
          A single slider at the top sets how much you pray. On an open morning,
          pray the whole of it. On a crowded day, slide down — the prayer
          shortens toward its heart, and never falls below the Lord's Prayer.
        </p>
        <p className="lede">
          The point is simply never to break the thread: pray fully when you can,
          briefly when you can't, but pray every day. That daily thread is the
          whole of it.
        </p>
        <div className="onboard-actions">
          <button className="btn btn-primary" onClick={() => setStep("rotation")}>
            Continue
          </button>
          <button className="btn btn-quiet" onClick={() => setStep("reminder")}>
            Go back
          </button>
        </div>
      </main>
    );
  }

  if (step === "rotation") {
    return (
      <main className="app onboard">
        <p className="eyebrow">What you'll pray</p>
        <h2 className="onboard-q">The streams that come round</h2>
        <p className="lede">
          As you pray, the same few streams rotate through, so the prayer stays
          alive rather than rote:
        </p>
        <ul className="rotation-list">
          <li>
            <span className="rotation-name">The Psalms, in course</span> — a
            portion each day, the whole Psalter over time, then begun again.
          </li>
          <li>
            <span className="rotation-name">The day's Gospel and Epistle</span> —
            one shared daily lectionary, read in your translation.
          </li>
          <li>
            <span className="rotation-name">Prayer with the early Church</span> —
            an ancient intercession, a different one each day.
          </li>
          <li>
            <span className="rotation-name">Your prayer list</span> — the people
            and needs you carry, named before God.
          </li>
          <li>
            <span className="rotation-name">A night prayer</span> — to close the
            evening in peace.
          </li>
        </ul>
        <p className="lede">
          Slide up and they are all there; slide down and they step back in turn,
          the Lord's Prayer always remaining.
        </p>
        <div className="onboard-actions">
          <button className="btn btn-primary" onClick={() => setStep("start")}>
            Continue
          </button>
          <button className="btn btn-quiet" onClick={() => setStep("how")}>
            Go back
          </button>
        </div>
      </main>
    );
  }

  // start
  return (
    <main className="app onboard">
      <p className="eyebrow">You're ready</p>
      <h2 className="onboard-q">Let us begin</h2>
      <p className="lede">
        {IS_EO
          ? "Everything's set, in the voice of the Orthodox Church."
          : `Everything's set, in the ${traditionName} voice you chose.`}{" "}
        Open today's prayer whenever you're ready — pray it in full, or pray
        just the Lord's Prayer. Either is faithful.
      </p>
      <div className="onboard-actions">
        <button
          className="btn btn-primary"
          onClick={() => {
            dispatch({ type: "onboard", rung: LAST_RUNG, tradition, translation });
            // The names feed the existing prayer list — same data, with the
            // chosen cadence; weekly names spread across the week's slots.
            let weekly = 0;
            names.forEach((n, i) =>
              dispatch({
                type: "addIntention",
                intention: {
                  id: makeId(i + 1),
                  text: n.text,
                  added: today,
                  answered: false,
                  cadence: n.cadence,
                  ...(n.cadence === "weekly" ? { bucket: weekly++ % 7 } : {}),
                },
              }),
            );
          }}
        >
          Start my rule
        </button>
        <button className="btn btn-quiet" onClick={() => setStep("rotation")}>
          Go back
        </button>
      </div>
    </main>
  );
}
