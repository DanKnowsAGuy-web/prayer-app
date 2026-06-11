import { useState } from "react";
import { useStore } from "../lib/store";
import {
  cadenceOf,
  categoryOf,
  effectiveCategory,
  nextWeeklyBucket,
  weekdayOf,
  type Cadence,
  type Intention,
  type IntentionCategory,
} from "../lib/engine";
import { CATEGORIES, categoryDef } from "../lib/intentions";

const makeId = (seed: number) => `i${seed.toString(36)}${Math.floor(seed % 1000)}`;

/** Departed and new-life keep their own rhythm, so the daily/weekly choice is moot. */
const FIXED_RHYTHM: IntentionCategory[] = ["departed", "new-life"];

/**
 * The prayer list manager, reached from the home screen. Add a name and a
 * petition to pray it under; most names follow a daily or weekly rhythm, while
 * the departed are kept on Fridays and new-life names for forty days. Tap any
 * name to move it to another petition, change its rhythm, or remove it.
 */
export function PrayerList({ onClose }: { onClose: () => void }) {
  const { state, today, dispatch } = useStore();
  const [name, setName] = useState("");
  const [cadence, setCadence] = useState<Cadence>("daily");
  const [category, setCategory] = useState<IntentionCategory>("general");
  const [editingId, setEditingId] = useState<string | null>(null);

  const wd = weekdayOf(today);
  const def = categoryDef(category);
  const fixedRhythm = FIXED_RHYTHM.includes(category);

  function add() {
    const trimmed = name.trim();
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
        bucket: cadence === "weekly" ? nextWeeklyBucket(state.intentions) : undefined,
        category,
      },
    });
    setName("");
    // Keep the chosen rhythm and petition — adding several at once is common.
  }

  // Names grouped under the petition they are prayed under today, in order.
  const groups = CATEGORIES.map((c) => ({
    def: c,
    items: state.intentions.filter((i) => effectiveCategory(i, today) === c.key),
  })).filter((g) => g.items.length > 0);

  return (
    <main className="app settings prayerlist">
      <div className="settings-bar">
        <button className="btn btn-quiet" onClick={onClose}>
          ← Done
        </button>
        <span className="reader-bar-title">Your prayer list</span>
      </div>

      <section className="settings-group">
        <h2 className="settings-h">Add someone</h2>
        <p className="settings-note">
          Choose a name and the petition to pray it under. The petition is read
          first, then the names held within it.
        </p>

        <form
          className="pl-add"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <input
            className="intention-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="A name"
            aria-label="The name to hold in prayer"
            maxLength={80}
          />

          <div className="pl-field">
            <span className="pl-field-label">Petition</span>
            <div className="pl-pills" role="group" aria-label="The petition to pray them under">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className={`pill ${category === c.key ? "is-on" : ""}`}
                  aria-pressed={category === c.key}
                  title={c.hint}
                  onClick={() => setCategory(c.key)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {!fixedRhythm && (
            <div className="pl-field">
              <span className="pl-field-label">Rhythm</span>
              <div className="pl-pills" role="group" aria-label="How often to pray">
                {(["daily", "weekly"] as Cadence[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`pill ${cadence === c ? "is-on" : ""}`}
                    aria-pressed={cadence === c}
                    onClick={() => setCadence(c)}
                  >
                    {c === "daily" ? "Daily" : "Weekly"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="pl-preview">
            Prayed: “{def.bid}”
            {def.schedule ? ` ${def.schedule}` : ""}
          </p>

          <button className="btn btn-primary" type="submit" disabled={!name.trim()}>
            Add to the list
          </button>
        </form>
      </section>

      {groups.length === 0 ? (
        <p className="intentions-empty">
          The people and needs you carry can rest here.
        </p>
      ) : (
        groups.map((g) => (
          <section className="settings-group pl-group" key={g.def.key}>
            <h2 className="settings-h">{g.def.label}</h2>
            <p className="pl-bid">{g.def.bid}</p>
            <ul className="pl-list">
              {g.items.map((i) => (
                <Row
                  key={i.id}
                  intention={i}
                  wd={wd}
                  today={today}
                  expanded={editingId === i.id}
                  onToggle={() => setEditingId(editingId === i.id ? null : i.id)}
                  onClose={() => setEditingId(null)}
                />
              ))}
            </ul>
          </section>
        ))
      )}

      <div className="onboard-actions">
        <button className="btn btn-primary" onClick={onClose}>
          Done
        </button>
      </div>
    </main>
  );
}

/** The rhythm/schedule chip for a name, reflecting its petition's rules. */
function scheduleTag(i: Intention, today: string, wd: number): string {
  const cat = effectiveCategory(i, today);
  if (cat === "departed") return "Fridays";
  if (cat === "new-life") return "New life";
  const cadence = cadenceOf(i);
  if (cadence === "daily") return "Daily";
  const inToday = (i.bucket ?? 0) % 7 === wd;
  return inToday ? "Weekly · today" : "Weekly";
}

function Row({
  intention: i,
  wd,
  today,
  expanded,
  onToggle,
  onClose,
}: {
  intention: Intention;
  wd: number;
  today: string;
  expanded: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const { dispatch } = useStore();
  const cadence = cadenceOf(i);
  const fixedRhythm = FIXED_RHYTHM.includes(effectiveCategory(i, today));

  return (
    <li className={`pl-item ${expanded ? "is-open" : ""}`}>
      <button className="pl-item-head" onClick={onToggle} aria-expanded={expanded}>
        <span className="pl-item-name">{i.text}</span>
        <span className="cadence-tag">{scheduleTag(i, today, wd)}</span>
      </button>

      {expanded && (
        <div className="pl-edit">
          <span className="pl-field-label">Move to</span>
          <div className="pl-pills" role="group" aria-label="Move to another petition">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                className={`pill ${categoryOf(i) === c.key ? "is-on" : ""}`}
                aria-pressed={categoryOf(i) === c.key}
                title={c.hint}
                onClick={() => dispatch({ type: "updateIntention", id: i.id, patch: { category: c.key } })}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="pl-edit-actions">
            {!fixedRhythm && (
              <button
                className="cadence-tag cadence-toggle"
                onClick={() => dispatch({ type: "toggleCadence", id: i.id })}
              >
                Make {cadence === "daily" ? "weekly" : "daily"}
              </button>
            )}
            <button
              className="btn btn-quiet pl-remove"
              onClick={() => {
                dispatch({ type: "removeIntention", id: i.id });
                onClose();
              }}
            >
              Remove “{i.text}”
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
