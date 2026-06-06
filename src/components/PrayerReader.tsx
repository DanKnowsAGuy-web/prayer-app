import { useCallback, useEffect, useMemo, useState } from "react";
import type { Practice } from "../lib/ladder";
import type { DayPart } from "../lib/daypart";
import { useStore } from "../lib/store";
import { loadReadings, readingsForDay, type DayReadings } from "../lib/readings";
import { loadPsalter, portionMovements } from "../lib/psalter";
import { disciplineStep } from "../lib/disciplineSteps";
import { resolvePractice, type Movement } from "../lib/resolve";
import { estimateSeconds, formatSegment, formatTotal } from "../lib/estimate";
import { TraditionEmblem } from "./TraditionEmblem";

/**
 * Praying a longer office happens in two steps:
 *   1. A build-out preview — every segment with its approximate time, where you
 *      can drop the parts you don't have time for and watch the total shrink.
 *   2. The prayer itself, laid out in full as one quiet, scrollable page.
 * Short prayers skip the preview and open straight to praying.
 */
export function PrayerReader({
  practice,
  part,
  petitionPart,
  onClose,
}: {
  practice: Practice;
  part: DayPart;
  petitionPart: DayPart;
  onClose: () => void;
}) {
  const { state, today, dispatch } = useStore();

  const hasGospel =
    practice.steps.some(
      (s) => s.dynamic === "gospel" || s.dynamic === "gospelEpistle",
    ) ||
    (state.prefs.scripture && part === "morning");
  const showsPsalm =
    (practice.steps.some((s) => s.dynamic === "psalm") || state.prefs.psalter) &&
    part === state.psalmTime;

  // The discipline step's collect for this part (if a step is active), passed
  // through to replace the rung's closing prayer.
  const activeStep = showsPsalm ? disciplineStep(state.psalmIndex + 1) : null;
  const disciplineCollect = activeStep
    ? part === "evening"
      ? activeStep.eveningCollect
      : activeStep.morningCollect
    : undefined;

  const [day, setDay] = useState<DayReadings | undefined>(undefined);
  const [psalmMovements, setPsalmMovements] = useState<Movement[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const jobs: Promise<unknown>[] = [];
    if (hasGospel) {
      jobs.push(
        loadReadings().then((b) => {
          if (active) setDay(readingsForDay(b, today));
        }),
      );
    }
    if (showsPsalm) {
      // Track A: the discipline step (psalms + reading + collect for this part)
      // takes precedence; otherwise fall back to the bundled BCP Psalter portion.
      const ds = disciplineStep(state.psalmIndex + 1);
      const volume = part === "evening" ? ds?.eveningPsalms : ds?.morningPsalms;
      if (ds && volume && volume.length) {
        const block: Movement[] = volume.map((text) => ({
          label: "Psalm",
          text,
          kind: "psalm" as const,
        }));
        const reading =
          part === "evening" ? ds.eveningShortReading : ds.morningShortReading;
        if (reading) block.push({ label: "A Reading", text: reading });
        // The collect is delivered via ctx.disciplineCollect so it can replace
        // the rung's closing prayer rather than sit mid-body.
        setPsalmMovements(block);
      } else {
        jobs.push(
          loadPsalter().then((b) => {
            if (active) {
              setPsalmMovements(
                portionMovements(b, state.psalmIndex).map((m) => ({
                  ...m,
                  kind: "psalm" as const,
                })),
              );
            }
          }),
        );
      }
    }
    Promise.allSettled(jobs).finally(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [today, hasGospel, showsPsalm, state.psalmIndex]);

  const movements = useMemo(
    () =>
      resolvePractice(practice, {
        day,
        intentions: state.intentions,
        part,
        psalmTime: state.psalmTime,
        psalmMovements,
        date: today,
        petitionTime: petitionPart,
        tradition: state.tradition,
        prefs: state.prefs,
        disciplineCollect,
      }),
    [
      practice,
      day,
      state.intentions,
      part,
      state.psalmTime,
      psalmMovements,
      today,
      petitionPart,
      state.tradition,
      state.prefs,
      disciplineCollect,
    ],
  );

  // Which segments are kept for today. Reset to "all" whenever the set changes.
  const [included, setIncluded] = useState<boolean[]>([]);
  useEffect(() => {
    setIncluded(Array(movements.length).fill(true));
  }, [movements.length]);

  const [phase, setPhase] = useState<"preview" | "pray">("preview");

  const kept = useMemo(
    () => movements.filter((_, i) => included[i]),
    [movements, included],
  );
  const psalmKept = movements.some((m, i) => included[i] && m.kind === "psalm");

  // Finishing a Psalm-bearing prayer moves the Psalter on — once a day, and only
  // if the Psalm portion was actually kept in the build-out.
  const handleClose = useCallback(() => {
    if (showsPsalm && psalmKept && state.lastPsalmAdvanceDate !== today) {
      dispatch({ type: "advancePsalm", date: today });
    }
    onClose();
  }, [showsPsalm, psalmKept, state.lastPsalmAdvanceDate, today, dispatch, onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  const loading = (hasGospel || showsPsalm) && !ready;
  const usePreview = movements.length > 3 && phase === "preview";

  if (loading) {
    return (
      <main className="reader" data-part={part}>
        <div className="reader-bar">
          <button className="btn btn-quiet reader-close" onClick={handleClose}>
            ← Close
          </button>
          <span className="reader-bar-title">
          <TraditionEmblem
            tradition={state.tradition}
            className="emblem emblem-bar"
          />
          {practice.title}
        </span>
        </div>
        <div className="reader-stage">
          <p className="reader-loading">Preparing today's prayer…</p>
        </div>
      </main>
    );
  }

  if (usePreview) {
    return (
      <BuildOut
        title={practice.title}
        movements={movements}
        included={included}
        onToggle={(i) =>
          setIncluded((prev) => prev.map((v, n) => (n === i ? !v : v)))
        }
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
          <TraditionEmblem
            tradition={state.tradition}
            className="emblem emblem-bar"
          />
          {practice.title}
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

function BuildOut({
  title,
  movements,
  included,
  onToggle,
  onBegin,
  onClose,
}: {
  title: string;
  movements: Movement[];
  included: boolean[];
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
          <p className="eyebrow">Today's prayer · about {formatTotal(totalSecs)}</p>
          <h1 className="buildout-title">How much time today?</h1>
          <p className="buildout-sub">
            Keep what you have time for. Tap a part to set it aside; you can
            always pray it tomorrow.
          </p>
        </header>

        <ul className="buildout-list">
          {movements.map((m, i) => {
            const on = included[i];
            return (
              <li key={i}>
                <button
                  className={`buildout-row ${on ? "" : "is-off"}`}
                  onClick={() => onToggle(i)}
                  aria-pressed={on}
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
          <button
            className="btn btn-primary"
            onClick={onBegin}
            disabled={!anyKept}
          >
            Begin · {formatTotal(totalSecs)}
          </button>
        </div>
      </div>
    </main>
  );
}
