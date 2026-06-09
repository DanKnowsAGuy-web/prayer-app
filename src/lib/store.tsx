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
  type Intention,
  type Prefs,
  type RuleState,
  type Tradition,
} from "./engine";
import type { Translation } from "./scripture";
import { loadState, saveState } from "./storage";

type Action =
  | {
      type: "onboard";
      rung: number;
      tradition: Tradition | null;
      translation?: Translation;
      prefs?: Prefs;
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
  | { type: "setPsalmTime"; time: "morning" | "evening" }
  | { type: "setPetitionTime"; time: "morning" | "evening" }
  | { type: "setTradition"; tradition: Tradition }
  | { type: "setTranslation"; translation: Translation }
  | { type: "markReadingDone"; which: "gospel" | "epistle"; date: string }
  | { type: "setPref"; key: keyof Prefs; value: boolean }
  | { type: "devPatch"; patch: Partial<RuleState> }
  | { type: "setReminder"; slot: "morning" | "evening"; time: string | null }
  | { type: "setCycleOn"; on: boolean }
  | { type: "advanceCycle"; date: string }
  | { type: "advancePsalm"; date: string }
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
        ...(action.prefs ? { prefs: action.prefs } : {}),
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
    case "setPref":
      return { ...state, prefs: { ...state.prefs, [action.key]: action.value } };
    case "devPatch":
      return { ...state, ...action.patch };
    case "setReminder":
      return {
        ...state,
        reminders: { ...state.reminders, [action.slot]: action.time },
      };
    case "setCycleOn":
      return { ...state, cycle: { ...state.cycle, on: action.on } };
    case "advanceCycle": {
      // Same-day latch: a re-open/double-tap can't advance twice.
      if (state.cycle.lastAdvanceDate === action.date) return state;
      // The Prologue is completed once, before Day 1, and does not advance the day.
      if (!state.cycle.prologueSeen) {
        return {
          ...state,
          cycle: { ...state.cycle, prologueSeen: true, lastAdvanceDate: action.date },
        };
      }
      return {
        ...state,
        cycle: {
          ...state.cycle,
          day: state.cycle.day + 1,
          lastAdvanceDate: action.date,
        },
      };
    }
    case "advancePsalm":
      return {
        ...state,
        psalmIndex: (state.psalmIndex + 1) % 60,
        lastPsalmAdvanceDate: action.date,
      };
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
