import { useState } from "react";
import { useStore } from "../lib/store";
import {
  weekdayOf,
  type CheckIn,
  type RuleState,
  type Tradition,
} from "../lib/engine";
import { serveCycleDay, prologueEntry } from "../lib/intercessoryCycle";
import { PrayerReader, type SoloContent } from "./PrayerReader";

/**
 * Hidden preview/testing panel — reached at `…/#dev`. Lets you set any state
 * directly (rung, step, date, tradition, elements, check-in history) so you can
 * preview any journey without waiting for real days. Not linked anywhere.
 */

const TRADITIONS: (Tradition | "none")[] = [
  "none",
  "anglican",
  "eastern-orthodox",
  "evangelical",
  "protestant",
  "roman-catholic",
];

/** Build a check-in log ending today: `kept` of the last `window` days. */
function makeLog(today: string, kept: number, window: number): CheckIn[] {
  const [y, m, d] = today.split("-").map(Number);
  const log: CheckIn[] = [];
  for (let i = window - 1; i >= 0; i--) {
    const dt = new Date(y, m - 1, d - i);
    const date = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    // Mark the most recent `kept` days as kept.
    log.push({ date, kept: i < kept });
  }
  return log;
}

export function DevPanel({ onClose }: { onClose: () => void }) {
  const { state, today, dispatch } = useStore();
  const patch = (p: Partial<RuleState>) => dispatch({ type: "devPatch", patch: p });
  const [viewing, setViewing] = useState<SoloContent | null>(null);

  const weekdayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
    weekdayOf(today)
  ];

  // What the intercessory cycle would serve right now.
  const c = state.cycle;
  const cycleServed = c.prologueSeen
    ? serveCycleDay(c.day)
    : { theme: "Prologue", entry: prologueEntry() };

  if (viewing) {
    return (
      <PrayerReader solo={viewing} onClose={() => setViewing(null)} />
    );
  }

  return (
    <main className="app dev">
      <div className="dev-bar">
        <button className="btn btn-quiet" onClick={onClose}>
          ← Back to app
        </button>
        <span className="reader-bar-title">Preview / Dev</span>
      </div>

      <section className="dev-group">
        <h2 className="dev-h">Date ({weekdayName})</h2>
        <div className="dev-row">
          <input
            className="intention-input"
            type="date"
            value={today}
            onChange={(e) => patch({ previewDate: e.target.value })}
          />
          <button
            className="btn btn-quiet"
            onClick={() => patch({ previewDate: undefined })}
          >
            Use real date
          </button>
        </div>
        <p className="dev-note">
          Drives the daily Gospel, the weekly prayer-list rotation, and check-in
          dates.
        </p>
      </section>

      <section className="dev-group">
        <h2 className="dev-h">Onboarding</h2>
        <div className="dev-row">
          <button
            className={`pill ${state.onboarded ? "is-on" : ""}`}
            onClick={() => patch({ onboarded: !state.onboarded })}
          >
            {state.onboarded ? "Onboarded" : "Not onboarded"}
          </button>
        </div>
      </section>

      <section className="dev-group">
        <h2 className="dev-h">Psalter step (1–60)</h2>
        <div className="dev-row">
          <input
            className="intention-input dev-num"
            type="number"
            min={1}
            max={60}
            value={state.psalmIndex + 1}
            onChange={(e) => {
              const n = Math.max(1, Math.min(60, Number(e.target.value) || 1));
              patch({ psalmIndex: n - 1 });
            }}
          />
          <span className="dev-note">Next portion / discipline step.</span>
        </div>
      </section>

      <section className="dev-group">
        <h2 className="dev-h">Tradition</h2>
        <div className="dev-row dev-wrap">
          {TRADITIONS.map((t) => {
            const on =
              t === "none" ? state.tradition === null : state.tradition === t;
            return (
              <button
                key={t}
                className={`pill ${on ? "is-on" : ""}`}
                onClick={() => patch({ tradition: t === "none" ? null : t })}
              >
                {t}
              </button>
            );
          })}
        </div>
      </section>

      <section className="dev-group">
        <h2 className="dev-h">Translation</h2>
        <div className="dev-row dev-wrap">
          {(["web", "kjv", "msb"] as const).map((t) => (
            <button
              key={t}
              className={`pill ${state.translation === t ? "is-on" : ""}`}
              onClick={() => dispatch({ type: "setTranslation", translation: t })}
            >
              {t === "web" ? "World English Bible" : t === "kjv" ? "King James" : "MSB"}
            </button>
          ))}
        </div>
      </section>

      <section className="dev-group">
        <h2 className="dev-h">Check-in history</h2>
        <div className="dev-row dev-wrap">
          <button
            className="btn btn-ghost"
            onClick={() => patch({ log: makeLog(today, 5, 7) })}
          >
            Kept 5 of 7 (→ advance offer)
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => patch({ log: makeLog(today, 0, 3) })}
          >
            Missed 3 in a row (→ simplify)
          </button>
          <button className="btn btn-quiet" onClick={() => patch({ log: [] })}>
            Clear log
          </button>
        </div>
        <p className="dev-note">
          Log has {state.log.length} day{state.log.length === 1 ? "" : "s"}.
          Advance offers need ≥5 check-ins.
        </p>
      </section>

      <section className="dev-group">
        <h2 className="dev-h">Intercessory cycle</h2>
        <div className="dev-row dev-wrap">
          <button
            className={`pill ${c.prologueSeen ? "is-on" : ""}`}
            onClick={() =>
              patch({ cycle: { ...c, prologueSeen: !c.prologueSeen } })
            }
          >
            {c.prologueSeen ? "Prologue seen" : "Prologue pending"}
          </button>
          <input
            className="intention-input dev-num"
            type="number"
            min={1}
            max={400}
            value={c.day}
            onChange={(e) =>
              patch({
                cycle: { ...c, day: Math.max(1, Number(e.target.value) || 1) },
              })
            }
            aria-label="Cycle day"
          />
        </div>
        <p className="dev-note">
          {c.prologueSeen
            ? `Day ${c.day} · ${cycleServed.theme} · ${cycleServed.entry.id}`
            : `Prologue · ${cycleServed.entry.id}`}
        </p>
        <button
          className="btn btn-ghost see-list"
          onClick={() =>
            setViewing({
              title: "Intercessory Cycle",
              movements: [
                {
                  label: cycleServed.theme,
                  text: cycleServed.entry.prayer,
                  source: cycleServed.entry.attribution,
                },
              ],
              onComplete: () => dispatch({ type: "advanceCycle", key: `${today}:dev` }),
            })
          }
        >
          Open this prayer
        </button>
      </section>

      <section className="dev-group">
        <button
          className="btn btn-primary"
          onClick={() => {
            dispatch({ type: "reset" });
            onClose();
          }}
        >
          Reset everything (first run)
        </button>
      </section>
    </main>
  );
}

