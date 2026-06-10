import { useStore, makeId } from "../lib/store";
import { unitLabel, UNIT_COUNT } from "../lib/psalter";
import { IS_EO } from "../lib/flavor";
import { useEffect } from "react";
import {
  loadPropers,
  propersFor,
  loadSaintLives,
  type ProperDay,
} from "../lib/propers";
import { dayAccent, fastLine } from "../lib/season";
import { MILESTONE_TEXT } from "../lib/milestones";
import { MATINS_PSALM_COUNT } from "../lib/matins";
import { PrayerReader, type SoloContent } from "./PrayerReader";
import {
  availableWindows,
  buildSummary,
  type SummaryWindow,
} from "../lib/ruleSummary";
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
  const [properDay, setProperDay] = useState<ProperDay | undefined>(undefined);
  const [life, setLife] = useState<SoloContent | null>(null);
  useEffect(() => {
    if (!IS_EO) return;
    let active = true;
    loadPropers().then((p) => {
      if (active) setProperDay(propersFor(p, today));
    });
    return () => {
      active = false;
    };
  }, [today]);
  const accent = IS_EO ? dayAccent(today, properDay) : {};
  const fasting = IS_EO ? fastLine(properDay) : null;
  const openLife = async () => {
    const lives = await loadSaintLives();
    const stories = lives.days[today] ?? [];
    setLife({
      title: "The Saint of the Day",
      movements: stories.length
        ? stories.map((st) => ({ label: st.t, text: st.s, source: "orthocal.info" }))
        : [
            {
              label: "The Saint of the Day",
              text: "No life of a saint is recorded for today. See oca.org/saints for the full calendar.",
            },
          ],
      onComplete: () => {},
    });
  };
  const checkIn = todaysCheckIn(state, today);
  const streak = keptStreak(state.log);
  const kept = keptInWindow(state.log);

  const now = new Date();
  // Lead with whichever office the time of day suggests, but show both.
  const leadPart: DayPart = defaultPart;

  if (life) {
    return <PrayerReader solo={life} onClose={() => setLife(null)} />;
  }

  // The most recent quiet first, mentioned for a week.
  const recentMilestone = [...state.milestones]
    .reverse()
    .find((m) => daysBetween(m.date, today) <= 7 && MILESTONE_TEXT[m.id]);

  return (
    <main className="app home">
      <header className="home-head">
        <TraditionEmblem
          tradition={state.tradition}
          className="emblem emblem-home"
        />
        <p className="eyebrow">{longDate(now)}</p>
        <h1
          className="home-greeting"
          style={accent.color ? { color: accent.color } : undefined}
        >
          {greeting(now)}.
        </h1>
        {(accent.label || fasting) && (
          <p className="dayinfo">
            {accent.label && (
              <span
                className="dayinfo-season"
                style={accent.color ? { color: accent.color } : undefined}
              >
                {accent.label}
              </span>
            )}
            {accent.label && fasting && <span className="dayinfo-sep"> · </span>}
            {fasting && <span className="dayinfo-fast">{fasting}</span>}
          </p>
        )}
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

        {IS_EO && (
          <div className="evening-block">
            <h3 className="evening-title">The Saint of the Day</h3>
            {properDay?.saint && <p className="today-goal">{properDay.saint}</p>}
            <div className="practice-row">
              <button className="btn btn-ghost" onClick={openLife}>
                Read the life of the saint
              </button>
            </div>
          </div>
        )}
      </section>

      {recentMilestone && (
        <aside className="offer offer-advance" role="status">
          <p className="offer-eyebrow">A quiet first</p>
          <p className="offer-body">{MILESTONE_TEXT[recentMilestone.id]}</p>
        </aside>
      )}

      <PsalmRotation />

      <CheckInPanel
        kept={checkIn?.kept}
        answered={!!checkIn}
        onAnswer={(k) => dispatch({ type: "checkIn", date: today, kept: k })}
      />

      <Intentions />

      <MyRule />

      {IS_EO && <FatherShare />}

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
        Next: {unitLabel(state.psalmIndex)}
      </h2>
      <p className="psalter-sub">
        A few psalms each office, in order through the whole Psalter — then begun
        again. Set how many you take when you pray.
      </p>
    </section>
  );
}

/**
 * EO edition: text your spiritual father a short overview of your prayer rule.
 * The message is generated from the prayer history, previewed and editable,
 * then handed to the phone's own texting app (sms:) — nothing is sent by the
 * app itself. On a desktop, the message is copied to the clipboard instead.
 */
function FatherShare() {
  const { state, today, dispatch } = useStore();
  const windows = availableWindows(state.amens, today);
  const [open, setOpen] = useState(false);
  const [window_, setWindow] = useState<SummaryWindow | null>(null);
  const [text, setText] = useState("");
  const [phone, setPhone] = useState(state.father.phone);
  const [name, setName] = useState(state.father.name);
  const [copied, setCopied] = useState(false);

  const begin = () => {
    const w = windows[windows.length - 1];
    setWindow(w);
    setText(buildSummary(state.amens, w, today, state.father.name));
    setPhone(state.father.phone);
    setName(state.father.name);
    setOpen(true);
  };
  const pickWindow = (w: SummaryWindow) => {
    setWindow(w);
    setText(buildSummary(state.amens, w, today, name));
  };

  const send = () => {
    dispatch({ type: "setFather", phone: phone.trim(), name: name.trim() });
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      // `?&body` is the form both iOS and Android accept.
      globalThis.location.href = `sms:${phone.trim()}?&body=${encodeURIComponent(text)}`;
    } else {
      navigator.clipboard
        ?.writeText(text)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 4000);
        })
        .catch(() => {
          // Clipboard unavailable — select the message so Ctrl+C works.
          const box = document.querySelector<HTMLTextAreaElement>(".father-text");
          box?.focus();
          box?.select();
        });
    }
  };

  return (
    <section className="father-share" aria-labelledby="father-h">
      <p className="eyebrow">Your spiritual father</p>
      <h2 id="father-h" className="intentions-h">
        Share your rule
      </h2>

      {windows.length === 0 ? (
        <p className="intentions-empty">
          Once you've been praying for a week, you can send your spiritual
          father a short overview of your rule from here.
        </p>
      ) : !open ? (
        <button className="btn btn-ghost see-list" onClick={begin}>
          Text an overview of my prayer rule
        </button>
      ) : (
        <div className="father-form">
          <div className="dev-row dev-wrap" role="group" aria-label="Over what period">
            {windows.map((w) => (
              <button
                key={w}
                className={`pill ${window_ === w ? "is-on" : ""}`}
                aria-pressed={window_ === w}
                onClick={() => pickWindow(w)}
              >
                {w === 7 ? "Last week" : w === 14 ? "Two weeks" : "Last month"}
              </button>
            ))}
          </div>
          <textarea
            className="intention-input father-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            aria-label="The message to send"
          />
          <input
            className="intention-input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="His phone number"
            aria-label="Your spiritual father's phone number"
          />
          <input
            className="intention-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional, signs the message)"
            aria-label="Your name"
          />
          <div className="intention-add-btns">
            <button
              className="btn btn-primary"
              onClick={send}
              disabled={!text.trim() || !phone.trim()}
            >
              Open in Messages
            </button>
            <button className="btn btn-quiet" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          {copied && (
            <p className="petition-note" role="status">
              Copied to your clipboard — paste it into any message.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

/** Whole days from a to b (local dates, b >= a). */
function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round(
    (new Date(by, bm - 1, bd).getTime() - new Date(ay, am - 1, ad).getTime()) / 86400000,
  );
}

/** The quiet dashboard: the rule as it has actually been kept. */
function MyRule() {
  const { state, today } = useStore();
  if (!state.amens.length) return null;

  const [ty, tm, td] = today.split("-").map(Number);
  const days: { date: string; m: boolean; e: boolean }[] = [];
  for (let i = 27; i >= 0; i--) {
    const dt = new Date(ty, tm - 1, td - i);
    const date = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    days.push({
      date,
      m: state.amens.some((a) => a.date === date && a.part === "morning"),
      e: state.amens.some((a) => a.date === date && a.part === "evening"),
    });
  }
  const mornings = state.amens.filter((a) => a.part === "morning").length;
  const evenings = state.amens.filter((a) => a.part === "evening").length;

  return (
    <section className="myrule" aria-labelledby="myrule-h">
      <p className="eyebrow">Your rule, kept</p>
      <h2 id="myrule-h" className="intentions-h">
        My rule
      </h2>
      <div className="dash-grid" aria-label="The last four weeks">
        {days.map((d) => (
          <span key={d.date} className="dash-day" title={d.date}>
            <span className={`dash-dot ${d.m ? "is-on" : ""}`} aria-hidden="true" />
            <span className={`dash-dot ${d.e ? "is-on" : ""}`} aria-hidden="true" />
          </span>
        ))}
      </div>
      <p className="psalter-sub">
        {mornings} morning{mornings === 1 ? "" : "s"} and {evenings} evening
        {evenings === 1 ? "" : "s"} prayed. The Psalter walk is at {unitLabel(state.psalmIndex)}
        {" "}({state.psalmIndex + 1} of {UNIT_COUNT}
        {state.psalterRounds > 0
          ? `, completed ${state.psalterRounds} time${state.psalterRounds === 1 ? "" : "s"}`
          : ""}
        ).
        {IS_EO &&
          ` The psalms of Matins are at ${(state.matinsPsalmIndex % MATINS_PSALM_COUNT) + 1} of ${MATINS_PSALM_COUNT}.`}
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
