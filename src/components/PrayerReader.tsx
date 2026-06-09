import { useCallback, useEffect, useMemo, useState } from "react";
import type { DayPart } from "../lib/daypart";
import { useStore } from "../lib/store";
import { loadPsalter, unitMovements, MAX_PSALMS } from "../lib/psalter";
import { canticleMovement } from "../lib/devotions";
import { serveCycleDay, prologueEntry } from "../lib/intercessoryCycle";
import {
  loadLectionary,
  lectionaryFor,
  loadScripture,
  passageFor,
} from "../lib/scripture";
import {
  assembleOffice,
  applyBindings,
  defaultIncluded,
  buildGospelMovement,
  buildEpistleMovement,
  MAX_LEVEL,
  type Movement,
} from "../lib/resolve";
import { estimateSeconds, formatSegment, formatTotal } from "../lib/estimate";
import { TraditionEmblem } from "./TraditionEmblem";

/** A single, pre-resolved prayer to render through the reader (e.g. the cycle). */
export type SoloContent = {
  title: string;
  movements: Movement[];
  /** Called when the reader is finished with Amen (marks the track complete). */
  onComplete: () => void;
};

/**
 * Renders the office (the value-spine prayer) by default, or a single
 * pre-resolved prayer in `solo` mode — reusing the same layout, emblem, and
 * Amen button without any of the office's assembly machinery.
 */
export function PrayerReader(props: {
  onClose: () => void;
  part?: DayPart;
  solo?: SoloContent;
}) {
  if (props.solo) {
    return <SoloPrayer solo={props.solo} onClose={props.onClose} />;
  }
  const part = props.part!;
  return (
    <OfficePrayer
      title={part === "evening" ? "Evening Prayer" : "Morning Prayer"}
      part={part}
      onClose={props.onClose}
    />
  );
}

/** Everything the office needs from today's data, loaded once. */
type OfficeData = {
  gospel?: Movement;
  epistle?: Movement;
  psalmMovements: Movement[];
};

/**
 * Include state for a chosen level, with the psalm count overlaid: the Psalms
 * are taken from the top of the sequence, so only the first `psalmCount` psalm
 * units are kept (and only when the level reaches the Psalms at all).
 */
function computeIncluded(
  movements: Movement[],
  level: number,
  psalmCount: number,
  prefs: { song: boolean; reflection: boolean },
): boolean[] {
  const base = defaultIncluded(movements, level, prefs);
  let psalmPos = 0;
  return base.map((on, i) => {
    if (movements[i].kind === "psalm") {
      const keep = on && psalmPos < psalmCount;
      psalmPos++;
      return keep;
    }
    return on;
  });
}

/**
 * Praying the office happens in two steps:
 *   1. A build-out — a single slider sets how much to pray (the value rank),
 *      with the live estimate above it and per-segment toggles below to
 *      fine-tune.
 *   2. The prayer itself, laid out as one quiet, scrollable page.
 */
function OfficePrayer({
  title,
  part,
  onClose,
}: {
  title: string;
  part: DayPart;
  onClose: () => void;
}) {
  const { state, today, dispatch } = useStore();

  const [data, setData] = useState<OfficeData>({ psalmMovements: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    setReady(false);
    async function load() {
      const next: OfficeData = { psalmMovements: [] };

      // Scripture: one matched plan, text in the chosen translation.
      const [lect, store] = await Promise.all([
        loadLectionary(),
        loadScripture(state.translation),
      ]);
      const refs = lectionaryFor(lect, today);
      if (refs?.gospel) {
        next.gospel = buildGospelMovement(
          refs.gospel,
          passageFor(store, refs.gospel),
          state.tradition,
        );
      }
      // The Epistle is evening-only; skip it in the morning.
      if (part === "evening" && refs?.epistle) {
        next.epistle = buildEpistleMovement(
          refs.epistle,
          passageFor(store, refs.epistle),
        );
      }

      // The Psalter in course: the next units from the pointer, in either office.
      const psalter = await loadPsalter();
      next.psalmMovements = unitMovements(psalter, state.psalmIndex, MAX_PSALMS);

      if (active) {
        setData(next);
        setReady(true);
      }
    }
    load().catch(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, [today, part, state.translation, state.psalmIndex, state.tradition]);

  // The intercessory cycle's prayer for today (only when the cycle is on).
  const cycleMovement = useMemo<Movement | undefined>(() => {
    if (!state.cycle.on) return undefined;
    const served = state.cycle.prologueSeen
      ? serveCycleDay(state.cycle.day)
      : { theme: "Prologue", entry: prologueEntry() };
    return {
      label: served.theme,
      text: served.entry.prayer,
      source: served.entry.attribution,
    };
  }, [state.cycle.on, state.cycle.prologueSeen, state.cycle.day]);

  const movements = useMemo(
    () =>
      assembleOffice({
        part,
        tradition: state.tradition,
        psalmMovements: data.psalmMovements,
        gospel: data.gospel,
        epistle: data.epistle,
        song: canticleMovement(part),
        cycle: cycleMovement,
        intentions: state.intentions,
        date: today,
        carry: {
          gospelDone: state.gospelDoneDate === today,
          epistleDone: state.epistleDoneDate === today,
        },
      }),
    [
      part,
      state.tradition,
      data,
      cycleMovement,
      state.intentions,
      today,
      state.gospelDoneDate,
      state.epistleDoneDate,
    ],
  );

  // The office opens at its fullest. The slider trims down the value rank.
  const maxLevel = MAX_LEVEL[part];
  const [level, setLevel] = useState(maxLevel);
  const [psalmCount, setPsalmCount] = useState(MAX_PSALMS);
  const [included, setIncluded] = useState<boolean[]>([]);
  useEffect(() => {
    setLevel(maxLevel);
    setPsalmCount(MAX_PSALMS);
    setIncluded(computeIncluded(movements, maxLevel, MAX_PSALMS, state.prefs));
    // Re-seed only when the candidate set changes shape, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, movements.length]);

  const onLevel = (lvl: number) => {
    setLevel(lvl);
    setIncluded(computeIncluded(movements, lvl, psalmCount, state.prefs));
  };
  const onPsalmCount = (n: number) => {
    setPsalmCount(n);
    setIncluded(computeIncluded(movements, level, n, state.prefs));
  };
  const onToggle = (i: number) =>
    setIncluded((prev) => prev.map((v, n) => (n === i ? !v : v)));

  // Frame bindings (doxology ↔ Psalms, closing ↔ a body) applied after changes.
  const effective = useMemo(
    () => applyBindings(movements, included.length ? included : []),
    [movements, included],
  );

  const [phase, setPhase] = useState<"preview" | "pray">("preview");
  const kept = useMemo(
    () => movements.filter((_, i) => effective[i]),
    [movements, effective],
  );

  // Finishing the office advances the usage tracks and marks the once-daily
  // readings — but only for what was actually kept through to the Amen.
  const handleClose = useCallback(() => {
    const keptKinds = new Set(kept.map((m) => m.kind));
    // Usage tracks advance once per office prayed (the reducer latches the key).
    const officeKey = `${today}:${part}`;
    // The Psalter advances by however many psalm units were prayed.
    const keptPsalms = kept.filter((m) => m.kind === "psalm").length;
    if (keptPsalms > 0) {
      dispatch({ type: "advancePsalm", key: officeKey, count: keptPsalms });
    }
    if (keptKinds.has("cycle")) {
      dispatch({ type: "advanceCycle", key: officeKey });
    }
    if (keptKinds.has("gospel")) {
      dispatch({ type: "markReadingDone", which: "gospel", date: today });
    }
    if (keptKinds.has("epistle")) {
      dispatch({ type: "markReadingDone", which: "epistle", date: today });
    }
    onClose();
  }, [kept, today, part, dispatch, onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  if (!ready) {
    return (
      <main className="reader" data-part={part}>
        <div className="reader-bar">
          <button className="btn btn-quiet reader-close" onClick={handleClose}>
            ← Close
          </button>
          <span className="reader-bar-title">
            <TraditionEmblem tradition={state.tradition} className="emblem emblem-bar" />
            {title}
          </span>
        </div>
        <div className="reader-stage">
          <p className="reader-loading">Preparing today's prayer…</p>
        </div>
      </main>
    );
  }

  if (phase === "preview") {
    return (
      <BuildOut
        title={title}
        movements={movements}
        included={effective}
        level={level}
        maxLevel={maxLevel}
        onLevel={onLevel}
        psalmCount={psalmCount}
        onPsalmCount={onPsalmCount}
        onToggle={onToggle}
        onBegin={() => setPhase("pray")}
        onClose={handleClose}
      />
    );
  }

  return (
    <main className="reader" data-part={part}>
      <div className="reader-bar">
        <button className="btn btn-quiet reader-close" onClick={handleClose}>
          ← Close
        </button>
        <span className="reader-bar-title">
          <TraditionEmblem tradition={state.tradition} className="emblem emblem-bar" />
          {title}
        </span>
      </div>

      <div className="reader-scroll">
        {kept.map((m, n) => (
          <section className="movement" key={n}>
            <p className="reader-label">{m.label}</p>
            {m.ref && <p className="reader-ref">{m.ref}</p>}
            {m.cross && (
              <p className="cross-mark" aria-label="Make the sign of the cross">
                ✛
              </p>
            )}
            <p className="reader-text">{m.text}</p>
            {m.source && <p className="reader-source">{m.source}</p>}
            {m.note && <p className="reader-note">{m.note}</p>}
          </section>
        ))}

        <div className="reader-end">
          <button className="btn btn-primary" onClick={handleClose}>
            Amen
          </button>
        </div>
      </div>
    </main>
  );
}

/**
 * Solo mode: one pre-resolved prayer laid out like the office, with the
 * user's own TraditionEmblem (never the prayer's historic origin) and an Amen
 * that marks the track complete. Closing without Amen does not advance.
 */
function SoloPrayer({ solo, onClose }: { solo: SoloContent; onClose: () => void }) {
  const { state } = useStore();
  const complete = useCallback(() => {
    solo.onComplete();
    onClose();
  }, [solo, onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <main className="reader" data-part="morning">
      <div className="reader-bar">
        <button className="btn btn-quiet reader-close" onClick={onClose}>
          ← Close
        </button>
        <span className="reader-bar-title">
          <TraditionEmblem tradition={state.tradition} className="emblem emblem-bar" />
          {solo.title}
        </span>
      </div>

      <div className="reader-scroll">
        {solo.movements.map((m, n) => (
          <section className="movement" key={n}>
            <p className="reader-label">{m.label}</p>
            {m.ref && <p className="reader-ref">{m.ref}</p>}
            <p className="reader-text">{m.text}</p>
            {m.source && <p className="reader-source">{m.source}</p>}
            {m.note && <p className="reader-note">{m.note}</p>}
          </section>
        ))}

        <div className="reader-end">
          <button className="btn btn-primary" onClick={complete}>
            Amen
          </button>
        </div>
      </div>
    </main>
  );
}

function BuildOut({
  title,
  movements,
  included,
  level,
  maxLevel,
  onLevel,
  psalmCount,
  onPsalmCount,
  onToggle,
  onBegin,
  onClose,
}: {
  title: string;
  movements: Movement[];
  included: boolean[];
  level: number;
  maxLevel: number;
  onLevel: (lvl: number) => void;
  psalmCount: number;
  onPsalmCount: (n: number) => void;
  onToggle: (i: number) => void;
  onBegin: () => void;
  onClose: () => void;
}) {
  const totalSecs = movements.reduce(
    (sum, m, i) => (included[i] ? sum + estimateSeconds(m) : sum),
    0,
  );
  const anyKept = included.some(Boolean);

  // The psalm rows form one contiguous group; a count selector trims from the
  // top of the sequence, so the walk stays in order.
  const psalmIdxs = movements.flatMap((m, i) => (m.kind === "psalm" ? [i] : []));
  const firstPsalm = psalmIdxs[0] ?? -1;
  const numPsalms = psalmIdxs.length;
  const psalmOptions = [...Array(numPsalms)].map((_, k) => numPsalms - k); // n..1

  return (
    <main className="reader buildout-screen">
      <div className="reader-bar">
        <button className="btn btn-quiet reader-close" onClick={onClose}>
          ← Close
        </button>
        <span className="reader-bar-title">{title}</span>
      </div>

      <div className="buildout">
        <header className="buildout-head">
          <p className="buildout-estimate">about {formatTotal(totalSecs)}</p>
          <input
            className="buildout-slider"
            type="range"
            min={1}
            max={maxLevel}
            step={1}
            value={level}
            onChange={(e) => onLevel(Number(e.target.value))}
            aria-label="How much to pray today"
          />
          <p className="buildout-sub">
            Slide to set how much you pray today, or fine-tune below. The Lord's
            Prayer always stays.
          </p>
        </header>

        <ul className="buildout-list">
          {movements.map((m, i) => {
            const on = included[i];
            const isFloor = m.kind === "lords";
            const isPsalm = m.kind === "psalm";
            const psalmPos = isPsalm ? psalmIdxs.indexOf(i) : -1;
            return (
              <li key={i}>
                {i === firstPsalm && (
                  <div className="psalm-count" role="group" aria-label="How many psalms">
                    <span className="psalm-count-label">Psalms</span>
                    <div className="psalm-count-opts">
                      {psalmOptions.map((n) => (
                        <button
                          key={n}
                          className={`psalm-count-btn ${psalmCount === n ? "is-on" : ""}`}
                          onClick={() => onPsalmCount(n)}
                          aria-pressed={psalmCount === n}
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        className={`psalm-count-btn ${psalmCount === 0 ? "is-on" : ""}`}
                        onClick={() => onPsalmCount(0)}
                        aria-pressed={psalmCount === 0}
                      >
                        none
                      </button>
                    </div>
                  </div>
                )}
                <button
                  className={`buildout-row ${on ? "" : "is-off"}`}
                  onClick={() =>
                    isFloor
                      ? undefined
                      : isPsalm
                        ? onPsalmCount(psalmPos + 1)
                        : onToggle(i)
                  }
                  aria-pressed={on}
                  disabled={isFloor}
                >
                  <span className="buildout-check" aria-hidden="true">
                    {on ? "✓" : "+"}
                  </span>
                  <span className="buildout-label">{m.label}</span>
                  <span className="buildout-time">
                    {formatSegment(estimateSeconds(m))}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="buildout-actions">
          <button className="btn btn-primary" onClick={onBegin} disabled={!anyKept}>
            Begin · {formatTotal(totalSecs)}
          </button>
        </div>
      </div>
    </main>
  );
}
