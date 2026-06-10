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
  { key: "song", label: "The Gospel song", hint: "The Benedictus in the morning, the Magnificat at night." },
  { key: "reflection", label: "A time of reflection", hint: "A pause to sit with the word after the readings." },
];

const TRANSLATIONS: { value: "web" | "kjv"; label: string; hint: string }[] = [
  { value: "web", label: "World English Bible", hint: "Modern English (public domain)." },
  { value: "kjv", label: "King James Version", hint: "Traditional English (public domain)." },
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
        <h2 className="settings-h">Scripture translation</h2>
        <p className="settings-note">
          The readings are the same either way — only the wording changes.
        </p>
        <div className="settings-traditions">
          {TRANSLATIONS.map((t) => (
            <button
              key={t.value}
              className={`pill ${state.translation === t.value ? "is-on" : ""}`}
              aria-pressed={state.translation === t.value}
              title={t.hint}
              onClick={() =>
                dispatch({ type: "setTranslation", translation: t.value })
              }
            >
              {t.label}
            </button>
          ))}
        </div>
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

      <p className="settings-version">Build {__BUILD__}</p>
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

