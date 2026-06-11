import { useEffect, useState } from "react";
import { useStore } from "./lib/store";
import { dayPart, type DayPart } from "./lib/daypart";
import { Onboarding } from "./components/Onboarding";
import { Home } from "./components/Home";
import { PrayerReader } from "./components/PrayerReader";
import { Settings } from "./components/Settings";
import { PrayerList } from "./components/PrayerList";
import { PriestShare } from "./components/PriestShare";
import { DevPanel } from "./components/DevPanel";
import { InstallHint } from "./components/InstallHint";
import { IS_PRIEST } from "./lib/flavor";
import "./styles/app.css";

export function App() {
  const { state } = useStore();
  // When reading, we hold which practice is open.
  const [reading, setReading] = useState<DayPart | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [prayerListOpen, setPrayerListOpen] = useState(false);

  // Hidden preview/testing panel at `…/#dev`.
  const [hash, setHash] = useState(() => window.location.hash);

  // Each screen starts at its top; the old screen's scroll must not carry over.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [reading, settingsOpen, prayerListOpen, state.onboarded, hash]);
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  // A warm candlelight glow accompanies every screen except prayer mode.
  const withGlow = (node: React.ReactNode) => (
    <>
      <div className="candle-glow" aria-hidden="true" />
      {node}
    </>
  );

  // The priest edition is a single screen: the send-a-rule tool, nothing else.
  if (IS_PRIEST) {
    return withGlow(<PriestShare />);
  }

  if (hash === "#dev") {
    return withGlow(
      <DevPanel
        onClose={() => {
          window.location.hash = "";
          setHash("");
        }}
      />,
    );
  }

  if (!state.onboarded) {
    return withGlow(<Onboarding />);
  }

  if (settingsOpen) {
    return withGlow(<Settings onClose={() => setSettingsOpen(false)} />);
  }

  if (prayerListOpen) {
    return withGlow(<PrayerList onClose={() => setPrayerListOpen(false)} />);
  }

  // Prayer mode keeps the existing atmosphere — no candle glow.
  if (reading) {
    return <PrayerReader part={reading} onClose={() => setReading(null)} />;
  }

  return withGlow(
    <>
      <Home
        onBeginPrayer={(part) => setReading(part)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenPrayerList={() => setPrayerListOpen(true)}
        defaultPart={dayPart(new Date())}
      />
      <InstallHint />
    </>,
  );
}
