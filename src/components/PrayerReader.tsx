import { useCallback, useEffect, useMemo, useState } from "react";
import type { Practice } from "../lib/ladder";
import type { DayPart } from "../lib/daypart";
import { useStore } from "../lib/store";
import { loadReadings, readingsForDay, type DayReadings } from "../lib/readings";
import { loadPsalter, portionMovements } from "../lib/psalter";
import { resolvePractice, type Movement } from "../lib/resolve";

/**
 * The day's prayer, laid out in full as one quiet, scrollable page. Dynamic
 * movements (the daily Gospel, the rotating Psalm portion, the intercession
 * with your names) are resolved before the page is shown. When a Psalm-bearing
 * prayer is finished, the Psalter rotation advances one portion — once per day.
 */
export function PrayerReader({
  practice,
  part,
  onClose,
}: {
  practice: Practice;
  part: DayPart;
  onClose: () => void;
}) {
  const { state, today, dispatch } = useStore();

  const hasGospel = practice.steps.some(
    (s) => s.dynamic === "gospel" || s.dynamic === "gospelEpistle",
  );
  const showsPsalm =
    practice.steps.some((s) => s.dynamic === "psalm") &&
    part === state.psalmTime;

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
      jobs.push(
        loadPsalter().then((b) => {
          if (active) setPsalmMovements(portionMovements(b, state.psalmIndex));
        }),
      );
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
      }),
    [practice, day, state.intentions, part, state.psalmTime, psalmMovements],
  );

  // Finishing a Psalm-bearing prayer moves the Psalter on, but only once a day.
  const handleClose = useCallback(() => {
    if (showsPsalm && state.lastPsalmAdvanceDate !== today) {
      dispatch({ type: "advancePsalm", date: today });
    }
    onClose();
  }, [showsPsalm, state.lastPsalmAdvanceDate, today, dispatch, onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  const loading = (hasGospel || showsPsalm) && !ready;

  return (
    <main className="reader" data-part={part}>
      <div className="reader-bar">
        <button className="btn btn-quiet reader-close" onClick={handleClose}>
          ← Close
        </button>
        <span className="reader-bar-title">{practice.title}</span>
      </div>

      {loading ? (
        <div className="reader-stage">
          <p className="reader-loading">Preparing today's prayer…</p>
        </div>
      ) : (
        <div className="reader-scroll">
          {movements.map((m, n) => (
            <section className="movement" key={n}>
              <p className="reader-label">{m.label}</p>
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
      )}
    </main>
  );
}
