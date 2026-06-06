import { useState } from "react";
import { useStore } from "./lib/store";
import { rungAt } from "./lib/ladder";
import { dayPart, type DayPart } from "./lib/daypart";
import { Onboarding } from "./components/Onboarding";
import { Home } from "./components/Home";
import { PrayerReader } from "./components/PrayerReader";
import "./styles/app.css";

export function App() {
  const { state } = useStore();
  // When reading, we hold which practice is open.
  const [reading, setReading] = useState<DayPart | null>(null);

  if (!state.onboarded) {
    return <Onboarding />;
  }

  const rung = rungAt(state.rung);

  // Petitions go in the chosen prayer, but fall back to morning when the
  // current rung has no evening prayer yet — so they're never orphaned.
  const petitionPart: DayPart =
    state.petitionTime === "evening" && rung.evening ? "evening" : "morning";

  if (reading) {
    const practice = reading === "evening" ? rung.evening : rung.morning;
    if (practice) {
      return (
        <PrayerReader
          practice={practice}
          part={reading}
          petitionPart={petitionPart}
          onClose={() => setReading(null)}
        />
      );
    }
  }

  return (
    <Home
      onBeginPrayer={(part) => setReading(part)}
      defaultPart={dayPart(new Date())}
    />
  );
}
