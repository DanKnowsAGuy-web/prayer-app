import { useStore } from "../lib/store";
import { LADDER } from "../lib/ladder";
import {
  weekdayOf,
  type CheckIn,
  type Prefs,
  type RuleState,
  type Tradition,
} from "../lib/engine";

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

const PREF_KEYS: (keyof Prefs)[] = [
  "scripture",
  "psalter",
  "silence",
  "jesusPrayer",
  "rosary",
  "dailyOffice",
  "litany",
  "devotional",
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

  const weekdayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
    weekdayOf(today)
  ];

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
        <h2 className="dev-h">Onboarding & rung</h2>
        <div className="dev-row">
          <button
            className={`pill ${state.onboarded ? "is-on" : ""}`}
            onClick={() => patch({ onboarded: !state.onboarded })}
          >
            {state.onboarded ? "Onboarded" : "Not onboarded"}
          </button>
        </div>
        <div className="dev-row dev-wrap">
          {LADDER.map((r) => (
            <button
              key={r.id}
              className={`pill ${state.rung === r.id ? "is-on" : ""}`}
              onClick={() => patch({ rung: r.id })}
            >
              {r.id}. {r.name}
            </button>
          ))}
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
        <h2 className="dev-h">Times</h2>
        <SegRow
          label="Psalms at"
          value={state.psalmTime}
          onChange={(t) => patch({ psalmTime: t })}
        />
        <SegRow
          label="Prayer list at"
          value={state.petitionTime}
          onChange={(t) => patch({ petitionTime: t })}
        />
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
        <h2 className="dev-h">Elements</h2>
        <div className="dev-row dev-wrap">
          {PREF_KEYS.map((k) => (
            <button
              key={k}
              className={`pill ${state.prefs[k] ? "is-on" : ""}`}
              onClick={() =>
                patch({ prefs: { ...state.prefs, [k]: !state.prefs[k] } })
              }
            >
              {k}
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

function SegRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: "morning" | "evening";
  onChange: (t: "morning" | "evening") => void;
}) {
  return (
    <div className="seg">
      <span className="seg-label">{label}</span>
      <div className="seg-track">
        <button
          className={`seg-btn ${value === "morning" ? "is-on" : ""}`}
          onClick={() => onChange("morning")}
        >
          Morning
        </button>
        <button
          className={`seg-btn ${value === "evening" ? "is-on" : ""}`}
          onClick={() => onChange("evening")}
        >
          Evening
        </button>
      </div>
    </div>
  );
}
