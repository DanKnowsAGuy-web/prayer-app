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

  if (reading) {
    const practice = reading === "evening" ? rung.evening : rung.morning;
    if (practice) {
      return (
        <PrayerReader
          practice={practice}
          part={reading}
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
