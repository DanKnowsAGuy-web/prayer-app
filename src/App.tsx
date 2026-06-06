import { useEffect, useState } from "react";
import { useStore } from "./lib/store";
import { rungAt } from "./lib/ladder";
import { dayPart, type DayPart } from "./lib/daypart";
import { Onboarding } from "./components/Onboarding";
import { Home } from "./components/Home";
import { PrayerReader } from "./components/PrayerReader";
import { Settings } from "./components/Settings";
import { DevPanel } from "./components/DevPanel";
import "./styles/app.css";

export function App() {
  const { state } = useStore();
  // When reading, we hold which practice is open.
  const [reading, setReading] = useState<DayPart | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Hidden preview/testing panel at `…/#dev`.
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  if (hash === "#dev") {
    return (
      <DevPanel
        onClose={() => {
          window.location.hash = "";
          setHash("");
        }}
      />
    );
  }

  if (!state.onboarded) {
    return <Onboarding />;
  }

  if (settingsOpen) {
    return <Settings onClose={() => setSettingsOpen(false)} />;
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
      onOpenSettings={() => setSettingsOpen(true)}
      defaultPart={dayPart(new Date())}
    />
  );
}
