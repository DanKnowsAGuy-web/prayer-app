import { useStore } from "../lib/store";
import type { Tradition } from "../lib/engine";
import { IS_EO } from "../lib/flavor";
import { buildReminderIcs, downloadIcs } from "../lib/ics";
import { useInstallState } from "../lib/install";

const TRADITIONS: { value: Tradition; label: string }[] = [
  { value: "anglican", label: "Anglican" },
  { value: "eastern-orthodox", label: "Eastern Orthodox" },
  { value: "evangelical", label: "Evangelical" },
  { value: "protestant", label: "Protestant" },
  { value: "roman-catholic", label: "Roman Catholic" },
];

const TRANSLATIONS: { value: "web" | "kjv" | "msb"; label: string; hint: string }[] = [
  { value: "web", label: "World English Bible", hint: "Modern English (public domain)." },
  { value: "kjv", label: "King James Version", hint: "Traditional English (public domain)." },
  { value: "msb", label: "MSB (Majority Standard Bible)", hint: "Modern English; its New Testament follows the Byzantine Majority Text (public domain)." },
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

      {!IS_EO && (
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
      )}

      <section className="settings-group">
        <h2 className="settings-h">Scripture translation</h2>
        <p className="settings-note">
          The readings are the same either way; only the wording changes.
        </p>
        <div className="settings-traditions">
          {TRANSLATIONS.filter((t) => !IS_EO || t.value !== "web").map((t) => (
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
          Set a time and add it to your phone's calendar, and it will remind you
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

      <InstallSection />

      <div className="onboard-actions">
        <button className="btn btn-primary" onClick={onClose}>
          Done
        </button>
      </div>

      <p className="settings-version">Build {__BUILD__}</p>
    </main>
  );
}

/**
 * A permanent home for the install action — always reachable, even after the
 * one-time banner was dismissed. Hidden only once the app is already installed.
 */
function InstallSection() {
  const { canPrompt, standalone, iOS, promptInstall } = useInstallState();
  if (standalone) return null;

  return (
    <section className="settings-group">
      <h2 className="settings-h">Install the app</h2>
      <p className="settings-note">
        Add Prayer to your home screen and it opens full-screen, with no address
        bar — and the screen stays awake while you pray.
      </p>
      {iOS ? (
        <p className="settings-note">
          In Safari, tap the Share icon, then <strong>Add to Home Screen</strong>.
        </p>
      ) : canPrompt ? (
        <button className="btn btn-ghost see-list" onClick={() => void promptInstall()}>
          Add to home screen
        </button>
      ) : (
        <p className="settings-note">
          Open your browser menu and choose <strong>Install</strong> or{" "}
          <strong>Add to Home screen</strong>.
        </p>
      )}
    </section>
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

