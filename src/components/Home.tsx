import { useStore, makeId } from "../lib/store";
import { portionLabel } from "../lib/psalter";
import { TraditionEmblem } from "./TraditionEmblem";
import {
  cadenceOf,
  nextWeeklyBucket,
  weekdayOf,
  type Cadence,
  type Intention,
} from "../lib/engine";
import { keptInWindow, keptStreak, todaysCheckIn } from "../lib/engine";
import { greeting, longDate, type DayPart } from "../lib/daypart";
import { useState } from "react";

export function Home({
  onBeginPrayer,
  onOpenSettings,
  defaultPart,
}: {
  onBeginPrayer: (part: DayPart) => void;
  onOpenSettings: () => void;
  defaultPart: DayPart;
}) {
  const { state, today, dispatch } = useStore();
  const checkIn = todaysCheckIn(state, today);
  const streak = keptStreak(state.log);
  const kept = keptInWindow(state.log);

  const now = new Date();
  // Lead with whichever office the time of day suggests, but show both.
  const leadPart: DayPart = defaultPart;

  return (
    <main className="app home">
      <header className="home-head">
        <TraditionEmblem
          tradition={state.tradition}
          className="emblem emblem-home"
        />
        <p className="eyebrow">{longDate(now)}</p>
        <h1 className="home-greeting">{greeting(now)}.</h1>
        <Faithfulness streak={streak} kept={kept} logged={state.log.length} />
      </header>

      <section className="today" aria-labelledby="today-h">
        <p className="eyebrow">Today's prayer</p>
        <h2 id="today-h" className="today-title">
          Morning Prayer
        </h2>
        <PracticeRow
          lead={leadPart === "morning"}
          onBegin={() => onBeginPrayer("morning")}
          label="Begin morning prayer"
        />

        <div className="evening-block">
          <h3 className="evening-title">Evening Prayer</h3>
          <PracticeRow
            lead={leadPart === "evening"}
            onBegin={() => onBeginPrayer("evening")}
            label="Begin evening prayer"
          />
        </div>
      </section>

      <PsalmRotation />

      <CheckInPanel
        kept={checkIn?.kept}
        answered={!!checkIn}
        onAnswer={(k) => dispatch({ type: "checkIn", date: today, kept: k })}
      />

      <Intentions />

      <p className="benediction">
        The Lord bless you and keep you, this day and always.
      </p>

      <div className="home-footer">
        <button className="btn btn-quiet" onClick={onOpenSettings}>
          Settings
        </button>
      </div>
    </main>
  );
}

function Faithfulness({
  streak,
  kept,
  logged,
}: {
  streak: number;
  kept: number;
  logged: number;
}) {
  if (logged === 0) {
    return <p className="faithful faithful-quiet">Your first day. Welcome.</p>;
  }
  if (streak >= 2) {
    return (
      <p className="faithful">
        Kept {streak} day{streak === 1 ? "" : "s"} in a row.
      </p>
    );
  }
  return (
    <p className="faithful">
      Kept {kept} of your last {Math.min(7, logged)} day{logged === 1 ? "" : "s"}.
    </p>
  );
}

function PracticeRow({
  lead,
  onBegin,
  label,
}: {
  lead: boolean;
  onBegin: () => void;
  label: string;
}) {
  return (
    <div className="practice-row">
      <button
        className={lead ? "btn btn-primary" : "btn btn-ghost"}
        onClick={onBegin}
      >
        {label}
      </button>
    </div>
  );
}

function PsalmRotation() {
  const { state } = useStore();
  return (
    <section className="psalter" aria-labelledby="psalter-h">
      <p className="eyebrow">The Psalter, in course</p>
      <h2 id="psalter-h" className="psalter-h">
        Next: {portionLabel(state.psalmIndex)}
      </h2>
      <p className="psalter-sub">
        One segment each office — morning takes one, evening the next — so the
        whole Psalter is prayed over thirty days, then begun again.
      </p>
    </section>
  );
}

function CheckInPanel({
  kept,
  answered,
  onAnswer,
}: {
  kept?: boolean;
  answered: boolean;
  onAnswer: (kept: boolean) => void;
}) {
  return (
    <section className="checkin" aria-labelledby="checkin-h">
      <p className="eyebrow">This evening</p>
      <h2 id="checkin-h" className="checkin-q">
        Did you keep your prayer today?
      </h2>
      {!answered ? (
        <div className="checkin-actions">
          <button className="btn btn-primary" onClick={() => onAnswer(true)}>
            Yes, I prayed
          </button>
          <button className="btn btn-ghost" onClick={() => onAnswer(false)}>
            Not today
          </button>
        </div>
      ) : (
        <div className="checkin-answered">
          <p className="checkin-result">
            {kept
              ? "Marked as kept. Well done, and thanks be to God."
              : "Marked as missed — no shame in it. Tomorrow is open."}
          </p>
          <button
            className="btn btn-quiet"
            onClick={() => onAnswer(!kept)}
          >
            Change to {kept ? "not today" : "I prayed"}
          </button>
        </div>
      )}
    </section>
  );
}

function Intentions() {
  const { state, today, dispatch } = useStore();
  const [text, setText] = useState("");
  // "Just added" is per-visit only; it does not persist across logins.
  const [sessionAdded, setSessionAdded] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  const wd = weekdayOf(today);

  function add(cadence: Cadence) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const id = makeId(Date.now() + state.intentions.length);
    dispatch({
      type: "addIntention",
      intention: {
        id,
        text: trimmed,
        added: today,
        answered: false,
        cadence,
        bucket:
          cadence === "weekly" ? nextWeeklyBucket(state.intentions) : undefined,
      },
    });
    setSessionAdded((prev) => [id, ...prev]);
    setText("");
  }

  function row(i: Intention) {
    const cadence = cadenceOf(i);
    const inToday = cadence === "weekly" && (i.bucket ?? 0) % 7 === wd;
    return (
      <li key={i.id} className={`intention ${i.answered ? "is-answered" : ""}`}>
        <button
          className="intention-toggle"
          onClick={() => dispatch({ type: "toggleIntention", id: i.id })}
          aria-pressed={i.answered}
          aria-label={i.answered ? "Mark as still praying" : "Mark as answered"}
        >
          <span className="intention-mark" aria-hidden="true" />
          <span className="intention-text">{i.text}</span>
        </button>
        <button
          className={`cadence-tag cadence-${cadence} ${inToday ? "is-today" : ""}`}
          onClick={() => dispatch({ type: "toggleCadence", id: i.id })}
          aria-label={`Praying ${cadence}. Tap to make ${
            cadence === "daily" ? "weekly" : "daily"
          }.`}
        >
          {cadence === "daily" ? "Daily" : inToday ? "Weekly · today" : "Weekly"}
        </button>
        <button
          className="intention-remove"
          onClick={() => dispatch({ type: "removeIntention", id: i.id })}
          aria-label={`Remove "${i.text}"`}
        >
          ×
        </button>
      </li>
    );
  }

  const recent = sessionAdded
    .map((id) => state.intentions.find((i) => i.id === id))
    .filter((i): i is Intention => Boolean(i));

  return (
    <section className="intentions" aria-labelledby="int-h">
      <p className="eyebrow">Held before God</p>
      <h2 id="int-h" className="intentions-h">
        Your prayer list
      </h2>

      <form
        className="intention-add"
        onSubmit={(e) => {
          e.preventDefault();
          add("daily");
        }}
      >
        <input
          className="intention-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="A name, a need, a thanksgiving…"
          aria-label="Add a prayer intention"
          maxLength={120}
        />
        <div className="intention-add-btns">
          <button className="btn btn-primary" type="submit" disabled={!text.trim()}>
            Add daily
          </button>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => add("weekly")}
            disabled={!text.trim()}
          >
            Add weekly
          </button>
        </div>
      </form>

      {recent.length > 0 && !showAll && (
        <div className="recent-added">
          <p className="recent-label">Just added</p>
          <ul className="intention-list">{recent.map(row)}</ul>
        </div>
      )}

      {state.intentions.length === 0 && recent.length === 0 ? (
        <p className="intentions-empty">
          The people and needs you carry can rest here. Daily names are prayed
          every day; weekly names come up once a week, in turn.
        </p>
      ) : showAll ? (
        <div className="full-list">
          <ul className="intention-list">{state.intentions.map(row)}</ul>
          <button className="btn btn-quiet" onClick={() => setShowAll(false)}>
            Hide list
          </button>
        </div>
      ) : (
        state.intentions.length > 0 && (
          <button
            className="btn btn-ghost see-list"
            onClick={() => setShowAll(true)}
          >
            See your prayer list ({state.intentions.length})
          </button>
        )
      )}
    </section>
  );
}
