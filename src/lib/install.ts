import { useEffect, useState } from "react";

/**
 * Shared home-screen-install state.
 *
 * Chrome fires `beforeinstallprompt` once, early — often before any single
 * component mounts. We capture it at module load into a singleton so both the
 * one-time banner and the always-present Settings entry can offer the native
 * one-tap install, rather than racing each other for the one event.
 */
export type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferred: InstallEvent | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallEvent;
    notify();
  });
  // Once installed, the captured prompt is spent.
  window.addEventListener("appinstalled", () => {
    deferred = null;
    notify();
  });
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

/**
 * Reactive view of install state. `canPrompt` is true only where the browser
 * offered a native install prompt (Chrome/Android); elsewhere callers fall back
 * to the manual Add-to-Home-Screen instruction.
 */
export function useInstallState() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  return {
    canPrompt: deferred !== null,
    standalone: isStandalone(),
    iOS: isIOS(),
    async promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
      if (!deferred) return "unavailable";
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      deferred = null;
      notify();
      return outcome;
    },
  };
}
