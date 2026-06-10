import { useEffect, useState } from "react";
import { useInstallState } from "../lib/install";

/**
 * A quiet, one-time invitation to add the app to the home screen — where it
 * opens full-screen, with no address bar, like a native app.
 *
 * It shows on any not-yet-installed browser (the manual Add-to-Home-Screen path
 * works everywhere); when Chrome has offered a native prompt, it also shows a
 * one-tap button. Once dismissed or installed, it stays gone — but Settings
 * keeps a permanent "Install" entry for anyone who waved it away.
 */
const DISMISS_KEY = "installHintDismissed";

export function InstallHint() {
  const { canPrompt, standalone, iOS, promptInstall } = useInstallState();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (standalone) return;
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // Private mode without storage: fall through and show once per session.
    }
    setShow(true);
  }, [standalone]);

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // No storage: it simply reappears next session, which is acceptable.
    }
  }

  async function install() {
    await promptInstall();
    dismiss();
  }

  if (!show || standalone) return null;

  return (
    <div className="install-hint" role="note">
      <p className="install-hint-text">
        {iOS ? (
          <>
            Add Prayer to your home screen — tap the Share icon, then{" "}
            <strong>Add to Home Screen</strong> — and it opens full-screen, like
            an app.
          </>
        ) : canPrompt ? (
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
        {canPrompt && (
          <button className="btn btn-primary" onClick={install}>
            Add to home screen
          </button>
        )}
        <button className="btn btn-quiet" onClick={dismiss}>
          {canPrompt ? "Not now" : "Got it"}
        </button>
      </div>
    </div>
  );
}
