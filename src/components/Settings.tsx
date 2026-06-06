import { useStore } from "../lib/store";
import type { Prefs, Tradition } from "../lib/engine";
import { buildReminderIcs, downloadIcs } from "../lib/ics";

const TRADITIONS: { value: Tradition; label: string }[] = [
  { value: "anglican", label: "Anglican" },
  { value: "eastern-orthodox", label: "Eastern Orthodox" },
  { value: "evangelical", label: "Evangelical" },
  { value: "protestant", label: "Protestant" },
  { value: "roman-catholic", label: "Roman Catholic" },
];

const ELEMENT_TOGGLES: { key: keyof Prefs; label: string; hint: string }[] = [
  { key: "scripture", label: "The daily Gospel", hint: "Read the day's Gospel in your morning prayer." },
  { key: "psalter", label: "The rotating Psalter", hint: "Pray through the Psalms, a portion a day." },
  { key: "dailyOffice", label: "A Daily Office canticle", hint: "The Benedictus or Magnificat." },
  { key: "jesusPrayer", label: "The Jesus Prayer", hint: "Lord Jesus Christ, have mercy on me." },
  { key: "rosary", label: "The Rosary", hint: "Today's mysteries and prayers." },
  { key: "litany", label: "A Litany", hint: "A litany below the readings (Gelasian form)." },
  { key: "silence", label: "A time of silence", hint: "A short stillness before God." },
  { key: "devotional", label: "Personal devotion", hint: "A prompt for prayer in your own words." },
];

export function Settings({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();

  return (
    <main className="app settings">
      <div className="settings-bar">
        <button className="btn btn-quiet" onClick={onClose}>
          ← Done
        </button>
        <span className="reader-bar-title">Settings</span>
      </div>

      <section className="settings-group">
        <h2 className="settings-h">Tradition</h2>
        <div className="settings-traditions">
          {TRADITIONS.map((t) => (
            <button
              key={t.value}
              className={`pill ${state.tradition === t.value ? "is-on" : ""}`}
              aria-pressed={state.tradition === t.value}
              onClick={() => dispatch({ type: "setTradition", tradition: t.value })}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="settings-group">
        <h2 className="settings-h">When you pray your Psalms and list</h2>
        <TimeRow
          label="Pray the Psalms at"
          value={state.psalmTime}
          onChange={(time) => dispatch({ type: "setPsalmTime", time })}
        />
        <TimeRow
          label="Pray your list at"
          value={state.petitionTime}
          onChange={(time) => dispatch({ type: "setPetitionTime", time })}
        />
      </section>

      <section className="settings-group">
        <h2 className="settings-h">Reminders</h2>
        <p className="settings-note">
          Set a time and add it to your phone's calendar — it will remind you
          every day, even when the app is closed.
        </p>
        <ReminderRow
          label="Morning prayer"
          value={state.reminders.morning}
          fallback="07:00"
          onChange={(time) =>
            dispatch({ type: "setReminder", slot: "morning", time })
          }
        />
        <ReminderRow
          label="Evening prayer"
          value={state.reminders.evening}
          fallback="20:00"
          onChange={(time) =>
            dispatch({ type: "setReminder", slot: "evening", time })
          }
        />
        <button
          className="btn btn-ghost see-list"
          disabled={!state.reminders.morning && !state.reminders.evening}
          onClick={() =>
            downloadIcs("prayer-reminders.ics", buildReminderIcs(state.reminders))
          }
        >
          Add prayer reminders to my calendar
        </button>
      </section>

      <section className="settings-group">
        <h2 className="settings-h">What your prayer includes</h2>
        <p className="settings-note">
          These are added on top of your current rule.
        </p>
        <ul className="toggle-list">
          {ELEMENT_TOGGLES.map((e) => {
            const on = state.prefs[e.key];
            return (
              <li key={e.key} className="toggle-row">
                <span className="toggle-text">
                  <span className="toggle-label">{e.label}</span>
                  <span className="toggle-hint">{e.hint}</span>
                </span>
                <button
                  className={`switch ${on ? "is-on" : ""}`}
                  role="switch"
                  aria-checked={on}
                  aria-label={`${e.label}: ${on ? "on" : "off"}`}
                  onClick={() =>
                    dispatch({ type: "setPref", key: e.key, value: !on })
                  }
                >
                  <span className="switch-knob" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="onboard-actions">
        <button className="btn btn-primary" onClick={onClose}>
          Done
        </button>
      </div>
    </main>
  );
}

function ReminderRow({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string | null;
  fallback: string;
  onChange: (time: string | null) => void;
}) {
  const on = value !== null;
  return (
    <div className="reminder-row">
      <span className="toggle-label">{label}</span>
      <div className="reminder-controls">
        {on && (
          <input
            className="intention-input reminder-time"
            type="time"
            value={value ?? fallback}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${label} time`}
          />
        )}
        <button
          className={`switch ${on ? "is-on" : ""}`}
          role="switch"
          aria-checked={on}
          aria-label={`${label} reminder ${on ? "on" : "off"}`}
          onClick={() => onChange(on ? null : fallback)}
        >
          <span className="switch-knob" />
        </button>
      </div>
    </div>
  );
}

function TimeRow({
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
          aria-pressed={value === "morning"}
          onClick={() => onChange("morning")}
        >
          Morning
        </button>
        <button
          className={`seg-btn ${value === "evening" ? "is-on" : ""}`}
          aria-pressed={value === "evening"}
          onClick={() => onChange("evening")}
        >
          Evening
        </button>
      </div>
    </div>
  );
}
