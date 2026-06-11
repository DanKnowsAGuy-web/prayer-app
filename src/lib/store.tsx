import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  cadenceOf,
  initialState,
  localDate,
  nextWeeklyBucket,
  type AmenRecord,
  type Intention,
  type RuleState,
  type Tradition,
} from "./engine";
import type { Translation } from "./scripture";
import { UNIT_COUNT } from "./psalter";
import { MATINS_PSALM_COUNT } from "./matins";
import { VESPERS_PSALM_COUNT } from "./vespers";
import { GOSPEL_CHAPTERS, gospelRefChapters } from "./milestones";
import { loadState, saveState } from "./storage";

/** Note a quiet first, once; later occurrences leave the state untouched. */
function withMilestone(state: RuleState, id: string, date: string): RuleState {
  if (state.milestones.some((m) => m.id === id)) return state;
  return { ...state, milestones: [...state.milestones, { id, date }] };
}

type Action =
  | {
      type: "onboard";
      rung: number;
      tradition: Tradition | null;
      translation?: Translation;
      psalmTime?: "morning" | "evening";
      petitionTime?: "morning" | "evening";
    }
  | { type: "checkIn"; date: string; kept: boolean }
  | { type: "setRung"; rung: number; dismissed?: string }
  | { type: "dismissAdvance"; date: string }
  | { type: "addIntention"; intention: Intention }
  | { type: "toggleIntention"; id: string }
  | { type: "toggleCadence"; id: string }
  | { type: "removeIntention"; id: string }
  | { type: "updateIntention"; id: string; patch: Partial<Intention> }
  | { type: "setPsalmTime"; time: "morning" | "evening" }
  | { type: "setPetitionTime"; time: "morning" | "evening" }
  | { type: "setTradition"; tradition: Tradition }
  | { type: "setTranslation"; translation: Translation }
  | { type: "markReadingDone"; which: "gospel" | "epistle"; date: string }
  | { type: "devPatch"; patch: Partial<RuleState> }
  | { type: "setReminder"; slot: "morning" | "evening"; time: string | null }
  | { type: "advanceCycle"; key: string }
  | { type: "advanceCanticle"; key: string }
  | { type: "advanceReflection"; key: string }
  | { type: "advanceConfession"; key: string }
  | { type: "markProvenanceSeen"; ids: string[] }
  | { type: "dismissProvenanceIntro" }
  | { type: "advancePsalm"; key: string; count: number }
  | { type: "advanceEoMorning"; date: string }
  | { type: "advanceEoEvening"; date: string }
  | { type: "advanceFragment"; date: string }
  | { type: "advanceMatinsPsalm"; date: string }
  | { type: "advanceVespersPsalm"; date: string }
  | { type: "recordAmen"; record: AmenRecord }
  | { type: "setFather"; phone: string; name: string }
  | { type: "reset" };

function reducer(state: RuleState, action: Action): RuleState {
  switch (action.type) {
    case "onboard":
      return {
        ...state,
        onboarded: true,
        rung: action.rung,
        tradition: action.tradition,
        ...(action.translation ? { translation: action.translation } : {}),
        ...(action.psalmTime ? { psalmTime: action.psalmTime } : {}),
        ...(action.petitionTime ? { petitionTime: action.petitionTime } : {}),
      };
    case "checkIn": {
      const log = state.log.filter((c) => c.date !== action.date);
      log.push({ date: action.date, kept: action.kept });
      log.sort((a, b) => a.date.localeCompare(b.date));
      return { ...state, log };
    }
    case "setRung":
      return { ...state, rung: action.rung, lastAdvanceDismissed: action.dismissed };
    case "dismissAdvance":
      return { ...state, lastAdvanceDismissed: action.date };
    case "addIntention":
      return { ...state, intentions: [action.intention, ...state.intentions] };
    case "toggleIntention":
      return {
        ...state,
        intentions: state.intentions.map((i) =>
          i.id === action.id ? { ...i, answered: !i.answered } : i,
        ),
      };
    case "toggleCadence":
      return {
        ...state,
        intentions: state.intentions.map((i) => {
          if (i.id !== action.id) return i;
          if (cadenceOf(i) === "weekly") {
            return { ...i, cadence: "daily", bucket: undefined };
          }
          return { ...i, cadence: "weekly", bucket: nextWeeklyBucket(state.intentions) };
        }),
      };
    case "removeIntention":
      return {
        ...state,
        intentions: state.intentions.filter((i) => i.id !== action.id),
      };
    case "updateIntention":
      return {
        ...state,
        intentions: state.intentions.map((i) =>
          i.id === action.id ? { ...i, ...action.patch, id: i.id } : i,
        ),
      };
    case "setPsalmTime":
      return { ...state, psalmTime: action.time };
    case "setPetitionTime":
      return { ...state, petitionTime: action.time };
    case "setTradition":
      return { ...state, tradition: action.tradition };
    case "setTranslation":
      return { ...state, translation: action.translation };
    case "markReadingDone": {
      const key = action.which === "gospel" ? "gospelDoneDate" : "epistleDoneDate";
      if (state[key] === action.date) return state;
      return { ...state, [key]: action.date };
    }
    case "devPatch":
      return { ...state, ...action.patch };
    case "setReminder":
      return {
        ...state,
        reminders: { ...state.reminders, [action.slot]: action.time },
      };
    case "advanceCycle": {
      // Per-office latch: a re-open/double-tap of the same office can't advance
      // twice, but morning and evening each advance once.
      if (state.cycle.lastAdvanceKey === action.key) return state;
      // The Prologue is completed once, before Day 1, and does not advance the day.
      if (!state.cycle.prologueSeen) {
        return {
          ...state,
          cycle: { ...state.cycle, prologueSeen: true, lastAdvanceKey: action.key },
        };
      }
      return {
        ...state,
        cycle: {
          ...state.cycle,
          day: state.cycle.day + 1,
          lastAdvanceKey: action.key,
        },
      };
    }
    case "advanceCanticle":
      if (state.lastCanticleAdvanceKey === action.key) return state;
      return {
        ...state,
        canticleIndex: state.canticleIndex + 1,
        lastCanticleAdvanceKey: action.key,
      };
    case "advanceReflection":
      if (state.lastReflectionAdvanceKey === action.key) return state;
      return {
        ...state,
        reflectionIndex: state.reflectionIndex + 1,
        lastReflectionAdvanceKey: action.key,
      };
    case "advanceConfession":
      if (state.lastConfessionAdvanceKey === action.key) return state;
      return {
        ...state,
        confessionIndex: state.confessionIndex + 1,
        lastConfessionAdvanceKey: action.key,
      };
    case "markProvenanceSeen": {
      const add = action.ids.filter((id) => !state.seenProvenance.includes(id));
      if (add.length === 0) return state;
      return { ...state, seenProvenance: [...state.seenProvenance, ...add] };
    }
    case "dismissProvenanceIntro":
      return { ...state, provenanceIntroSeen: true };
    case "advanceEoMorning":
      // One morning prayer per day; a re-open/double-Amen can't advance twice.
      if (state.lastEoMorningAdvanceDate === action.date) return state;
      return {
        ...state,
        eoMorningIndex: state.eoMorningIndex + 1,
        lastEoMorningAdvanceDate: action.date,
      };
    case "advanceEoEvening":
      if (state.lastEoEveningAdvanceDate === action.date) return state;
      return {
        ...state,
        eoEveningIndex: state.eoEveningIndex + 1,
        lastEoEveningAdvanceDate: action.date,
      };
    case "advanceFragment":
      if (state.lastFragmentAdvanceDate === action.date) return state;
      return {
        ...state,
        matinsFragmentIndex: state.matinsFragmentIndex + 1,
        lastFragmentAdvanceDate: action.date,
      };
    case "advanceMatinsPsalm": {
      if (state.lastMatinsPsalmAdvanceDate === action.date) return state;
      let next: RuleState = {
        ...state,
        matinsPsalmIndex: state.matinsPsalmIndex + 1,
        lastMatinsPsalmAdvanceDate: action.date,
      };
      if (next.matinsPsalmIndex === MATINS_PSALM_COUNT) {
        next = withMilestone(next, "matins-psalms", action.date);
      }
      return next;
    }
    case "advanceVespersPsalm": {
      if (state.lastVespersPsalmAdvanceDate === action.date) return state;
      let next: RuleState = {
        ...state,
        vespersPsalmIndex: state.vespersPsalmIndex + 1,
        lastVespersPsalmAdvanceDate: action.date,
      };
      if (next.vespersPsalmIndex === VESPERS_PSALM_COUNT) {
        next = withMilestone(next, "vespers-psalms", action.date);
      }
      return next;
    }
    case "recordAmen": {
      // One record per office per day; a repeat replaces it.
      const amens = state.amens.filter(
        (a) => !(a.date === action.record.date && a.part === action.record.part),
      );
      amens.push(action.record);
      amens.sort((a, b) => a.date.localeCompare(b.date));
      let next: RuleState = { ...state, amens };

      // Gospel coverage: track the chapters read; whole books are quiet firsts.
      if (action.record.gospelRef) {
        const parsed = gospelRefChapters(action.record.gospelRef);
        if (parsed) {
          const had = next.gospelChapters[parsed.book] ?? [];
          const merged = [...new Set([...had, ...parsed.chapters])].sort((a, b) => a - b);
          next = {
            ...next,
            gospelChapters: { ...next.gospelChapters, [parsed.book]: merged },
          };
          if (merged.length >= GOSPEL_CHAPTERS[parsed.book]) {
            next = withMilestone(next, `gospel-${parsed.book}`, action.record.date);
            const allFour = Object.entries(GOSPEL_CHAPTERS).every(
              ([b, n]) => (next.gospelChapters[b] ?? []).length >= n,
            );
            if (allFour) next = withMilestone(next, "gospels-all", action.record.date);
          }
        }
      }

      // The first time the whole morning rule was prayed entire.
      if (action.record.full) {
        next = withMilestone(next, "matins-full", action.record.date);
      }
      return next;
    }
    case "setFather":
      return { ...state, father: { phone: action.phone, name: action.name } };
    case "advancePsalm": {
      // Per-office latch; advance by however many psalm units were prayed.
      if (state.lastPsalmAdvanceKey === action.key || action.count <= 0) return state;
      const raw = state.psalmIndex + action.count;
      const wrapped = raw >= UNIT_COUNT;
      let next: RuleState = {
        ...state,
        psalmIndex: raw % UNIT_COUNT,
        psalterRounds: state.psalterRounds + (wrapped ? 1 : 0),
        lastPsalmAdvanceKey: action.key,
      };
      if (wrapped) next = withMilestone(next, "psalter", action.key.slice(0, 10));
      return next;
    }
    case "reset":
      return initialState();
    default:
      return state;
  }
}

type Store = {
  state: RuleState;
  today: string;
  dispatch: React.Dispatch<Action>;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Dev/preview override lets the app time-travel; otherwise the real date.
  const today = state.previewDate ?? localDate(new Date());
  const value = useMemo<Store>(() => ({ state, today, dispatch }), [state, today]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

/** A simple unique id without external deps. */
export function makeId(seed: number): string {
  return `${seed.toString(36)}-${(seed % 9973).toString(36)}`;
}
