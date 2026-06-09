import { useCallback, useEffect, useMemo, useState } from "react";
import type { Practice } from "../lib/ladder";
import type { DayPart } from "../lib/daypart";
import { useStore } from "../lib/store";
import { loadPsalter, portionMovements } from "../lib/psalter";
import { disciplineStep } from "../lib/disciplineSteps";
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
  practice?: Practice;
  part?: DayPart;
  petitionPart?: DayPart;
  solo?: SoloContent;
}) {
  if (props.solo) {
    return <SoloPrayer solo={props.solo} onClose={props.onClose} />;
  }
  return (
    <OfficePrayer
      title={props.practice!.title}
      part={props.part!}
      petitionPart={props.petitionPart!}
      onClose={props.onClose}
    />
  );
}

/** Everything the office needs from today's data, loaded once. */
type OfficeData = {
  gospel?: Movement;
  epistle?: Movement;
  psalmMovements: Movement[];
  reading?: Movement;
  disciplineCollect?: string;
};

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
  petitionPart,
  onClose,
}: {
  title: string;
  part: DayPart;
  petitionPart: DayPart;
  onClose: () => void;
}) {
  const { state, today, dispatch } = useStore();
  const showPsalms = part === state.psalmTime;
  const showPetitions = part === petitionPart;

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
      if (refs?.epistle) {
        next.epistle = buildEpistleMovement(
          refs.epistle,
          passageFor(store, refs.epistle),
        );
      }

      // Psalms: the discipline step takes precedence; else the Psalter portion.
      if (showPsalms) {
        const ds = disciplineStep(state.psalmIndex + 1);
        const volume = part === "evening" ? ds?.eveningPsalms : ds?.morningPsalms;
        if (ds && volume && volume.length) {
          next.psalmMovements = volume.map((text) => ({ label: "Psalm", text }));
          const reading =
            part === "evening" ? ds.eveningShortReading : ds.morningShortReading;
          if (reading) next.reading = { label: "A reading", text: reading };
          next.disciplineCollect =
            part === "evening" ? ds.eveningCollect : ds.morningCollect;
        } else {
          const b = await loadPsalter();
          next.psalmMovements = portionMovements(b, state.psalmIndex);
        }
      }
      if (active) {
        setData(next);
        setReady(true);
      }
    }
    load().catch(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, [today, part, showPsalms, state.translation, state.psalmIndex, state.tradition]);

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
        reading: data.reading,
        cycle: cycleMovement,
        intentions: state.intentions,
        showPetitions,
        date: today,
        disciplineCollect: data.disciplineCollect,
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
      showPetitions,
      today,
      state.gospelDoneDate,
      state.epistleDoneDate,
    ],
  );

  // The office opens at its fullest. The slider trims down the value rank.
  const maxLevel = MAX_LEVEL[part];
  const [level, setLevel] = useState(maxLevel);
  const [included, setIncluded] = useState<boolean[]>([]);
  useEffect(() => {
    setLevel(maxLevel);
    setIncluded(defaultIncluded(movements, maxLevel, state.prefs));
    // Re-seed only when the candidate set changes shape, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, movements.length]);

  const onLevel = (lvl: number) => {
    setLevel(lvl);
    setIncluded(defaultIncluded(movements, lvl, state.prefs));
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
    if (keptKinds.has("psalm") && state.lastPsalmAdvanceDate !== today) {
      dispatch({ type: "advancePsalm", date: today });
    }
    if (keptKinds.has("cycle")) {
      dispatch({ type: "advanceCycle", date: today });
    }
    if (keptKinds.has("gospel")) {
      dispatch({ type: "markReadingDone", which: "gospel", date: today });
    }
    if (keptKinds.has("epistle")) {
      dispatch({ type: "markReadingDone", which: "epistle", date: today });
    }
    onClose();
  }, [kept, state.lastPsalmAdvanceDate, today, dispatch, onClose]);

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
  onToggle: (i: number) => void;
  onBegin: () => void;
  onClose: () => void;
}) {
  const totalSecs = movements.reduce(
    (sum, m, i) => (included[i] ? sum + estimateSeconds(m) : sum),
    0,
  );
  const anyKept = included.some(Boolean);

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
            return (
              <li key={i}>
                <button
                  className={`buildout-row ${on ? "" : "is-off"}`}
                  onClick={() => !isFloor && onToggle(i)}
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
