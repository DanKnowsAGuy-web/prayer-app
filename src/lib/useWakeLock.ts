import { useEffect } from "react";

/**
 * Keeps the screen awake for as long as the calling component is mounted.
 *
 * Praying is a screen you look at without touching — the phone would otherwise
 * dim and sleep mid-psalm. The Screen Wake Lock API holds the display on; we
 * release it the moment the reader closes, and re-acquire it if the user leaves
 * the tab and returns (the browser drops the lock on every visibility change).
 *
 * Where the API is unavailable (older browsers), this is a quiet no-op.
 */
export function useWakeLock(active = true): void {
  useEffect(() => {
    if (!active) return;
    const nav = navigator as Navigator & {
      wakeLock?: { request(type: "screen"): Promise<WakeLockSentinel> };
    };
    if (!nav.wakeLock) return;

    let sentinel: WakeLockSentinel | null = null;
    let released = false;

    const acquire = async () => {
      if (released || document.visibilityState !== "visible") return;
      try {
        sentinel = await nav.wakeLock!.request("screen");
      } catch {
        // A denied or interrupted request is non-fatal; the screen simply sleeps.
      }
    };

    // The lock is lost whenever the page is hidden; take it back on return.
    const onVisible = () => {
      if (document.visibilityState === "visible") void acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      released = true;
      document.removeEventListener("visibilitychange", onVisible);
      void sentinel?.release().catch(() => {});
      sentinel = null;
    };
  }, [active]);
}
