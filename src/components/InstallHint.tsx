import { useEffect, useState } from "react";

/**
 * A quiet, one-time invitation to add the app to the home screen — where it
 * opens full-screen, with no address bar, like a native app.
 *
 * Two paths, because the platforms differ:
 *   • Chrome / Android fire `beforeinstallprompt`; we capture it and offer an
 *     "Add" button that triggers the real install dialog.
 *   • iOS Safari has no such event — installing is a manual Share → Add to Home
 *     Screen — so we show that one short instruction instead.
 *
 * It never shows when already launched from the home screen, and once the user
 * dismisses (or installs) it, it stays gone.
 */
const DISMISS_KEY = "installHintDismissed";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

export function InstallHint() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [show, setShow] = useState(false);
  const iOS = isIOS();

  useEffect(() => {
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // Private mode without storage: fall through and show once per session.
    }

    // Show the hint on any not-yet-installed browser — the manual "Add to Home
    // Screen" path works everywhere. Chrome's `beforeinstallprompt` is only an
    // enhancement: when it fires, we also offer a one-tap native button. We do
    // NOT wait for it, since on desktop it's unreliable and often never fires.
    setShow(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const onInstalled = () => dismiss();
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // No storage: it simply reappears next session, which is acceptable.
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  }

  if (!show) return null;

  return (
    <div className="install-hint" role="note">
      <p className="install-hint-text">
        {iOS ? (
          <>
            Add Prayer to your home screen — tap the Share icon, then{" "}
            <strong>Add to Home Screen</strong> — and it opens full-screen, like
            an app.
          </>
        ) : deferred ? (
          <>Add Prayer to your home screen and it opens full-screen, like an app.</>
        ) : (
          <>
            Install Prayer to open it full-screen, like an app — use your
            browser menu and choose <strong>Install</strong> or{" "}
            <strong>Add to Home screen</strong>.
          </>
        )}
      </p>
      <div className="install-hint-actions">
        {!iOS && deferred && (
          <button className="btn btn-primary" onClick={install}>
            Add to home screen
          </button>
        )}
        <button className="btn btn-quiet" onClick={dismiss}>
          {iOS ? "Got it" : "Not now"}
        </button>
      </div>
    </div>
  );
}
