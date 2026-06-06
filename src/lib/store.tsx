import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  initialState,
  localDate,
  type Intention,
  type RuleState,
} from "./engine";
import { loadState, saveState } from "./storage";

type Action =
  | { type: "onboard"; rung: number }
  | { type: "checkIn"; date: string; kept: boolean }
  | { type: "setRung"; rung: number; dismissed?: string }
  | { type: "dismissAdvance"; date: string }
  | { type: "addIntention"; intention: Intention }
  | { type: "toggleIntention"; id: string }
  | { type: "removeIntention"; id: string }
  | { type: "setPsalmTime"; time: "morning" | "evening" }
  | { type: "advancePsalm"; date: string }
  | { type: "reset" };

function reducer(state: RuleState, action: Action): RuleState {
  switch (action.type) {
    case "onboard":
      return { ...state, onboarded: true, rung: action.rung };
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
    case "removeIntention":
      return {
        ...state,
        intentions: state.intentions.filter((i) => i.id !== action.id),
      };
    case "setPsalmTime":
      return { ...state, psalmTime: action.time };
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

  const today = localDate(new Date());
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
