import { useState } from "react";
import { useStore } from "../lib/store";
import {
  cadenceOf,
  categoryOf,
  nextWeeklyBucket,
  weekdayOf,
  type Cadence,
  type Intention,
  type IntentionCategory,
} from "../lib/engine";
import { CATEGORIES, intentionLine } from "../lib/intentions";

const makeId = (seed: number) => `i${seed.toString(36)}${Math.floor(seed % 1000)}`;

/**
 * The prayer list manager, reached from the home screen. Add a name with a
 * rhythm (daily/weekly) and a category that supplies the words it is prayed
 * with; tap any name to move it to another category, change its rhythm, or
 * remove it.
 */
export function PrayerList({ onClose }: { onClose: () => void }) {
  const { state, today, dispatch } = useStore();
  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [cadence, setCadence] = useState<Cadence>("daily");
  const [category, setCategory] = useState<IntentionCategory>("general");
  const [editingId, setEditingId] = useState<string | null>(null);

  const wd = weekdayOf(today);

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
        ...(context.trim() ? { context: context.trim() } : {}),
      },
    });
    setName("");
    setContext("");
    // Keep the chosen cadence and category — adding several at once is common.
  }

  // Names grouped under their category, in the canonical order.
  const groups = CATEGORIES.map((c) => ({
    def: c,
    items: state.intentions.filter((i) => categoryOf(i) === c.key),
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
          Daily names are prayed every day; weekly names come up once a week, in
          turn. The category gives the words they are prayed with.
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
          <input
            className="intention-input"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="A word of context — optional (e.g. my grandmother)"
            aria-label="An optional word of context"
            maxLength={60}
          />

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

          <div className="pl-field">
            <span className="pl-field-label">Category</span>
            <div className="pl-pills" role="group" aria-label="Why they are held in prayer">
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

          {name.trim() && (
            <p className="pl-preview">
              Prayed: “{CATEGORIES.find((c) => c.key === category)!.line(name.trim(), context.trim() || undefined)}.”
            </p>
          )}

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
            <ul className="pl-list">
              {g.items.map((i) => (
                <Row
                  key={i.id}
                  intention={i}
                  wd={wd}
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

function Row({
  intention: i,
  wd,
  expanded,
  onToggle,
  onClose,
}: {
  intention: Intention;
  wd: number;
  expanded: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const { dispatch } = useStore();
  const cadence = cadenceOf(i);
  const inToday = cadence === "weekly" && (i.bucket ?? 0) % 7 === wd;

  return (
    <li className={`pl-item ${expanded ? "is-open" : ""}`}>
      <button className="pl-item-head" onClick={onToggle} aria-expanded={expanded}>
        <span className="pl-item-name">{i.text}</span>
        <span className={`cadence-tag cadence-${cadence} ${inToday ? "is-today" : ""}`}>
          {cadence === "daily" ? "Daily" : inToday ? "Weekly · today" : "Weekly"}
        </span>
      </button>

      <p className="pl-item-line">{intentionLine(i)}.</p>

      {expanded && (
        <div className="pl-edit">
          <span className="pl-field-label">Move to</span>
          <div className="pl-pills" role="group" aria-label="Move to another category">
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
            <button
              className="cadence-tag cadence-toggle"
              onClick={() => dispatch({ type: "toggleCadence", id: i.id })}
            >
              Make {cadence === "daily" ? "weekly" : "daily"}
            </button>
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
