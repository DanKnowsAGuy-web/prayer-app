import { useState } from "react";

/**
 * The priest's send-a-rule tool (the `priest` flavor — a single screen).
 *
 * The priest enters his name, the parishioner's first name, and their phone
 * number, previews the message, and taps Send. On a phone this hands off to the
 * device's own Messages app, pre-filled with the message and the link to the
 * prayer edition — nothing is sent by this app itself. On a desktop the message
 * is copied to the clipboard instead.
 */

/** The parishioner edition the link points to. */
const PRAYER_APP_URL = "https://danknowsaguy-web.github.io/sjotl-prayer-app/";

function buildMessage(firstName: string, priestName: string): string {
  const first = firstName.trim() || "Friend";
  const signoff = priestName.trim() ? ` — ${priestName.trim()}` : "";
  return `${first}, the following link may assist you in your prayer rule: ${PRAYER_APP_URL}${signoff}`;
}

export function PriestShare() {
  // Prefilled for this test case; the priest can change it.
  const [priestName, setPriestName] = useState("Father Alexander");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [copied, setCopied] = useState(false);

  const message = buildMessage(firstName, priestName);
  const ready = firstName.trim().length > 0 && phone.trim().length > 0;

  const send = () => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      // `?&body` is the form both iOS and Android accept.
      globalThis.location.href = `sms:${phone.trim()}?&body=${encodeURIComponent(message)}`;
    } else {
      navigator.clipboard
        ?.writeText(message)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 4000);
        })
        .catch(() => {
          const box = document.querySelector<HTMLTextAreaElement>(".priest-preview");
          box?.focus();
          box?.select();
        });
    }
  };

  return (
    <main className="app priest">
      <header className="priest-head">
        <p className="eyebrow">A rule of prayer</p>
        <h1 className="priest-title">Send a prayer rule</h1>
        <p className="priest-sub">
          Send someone in your care a link to begin their daily prayer.
        </p>
      </header>

      <section className="priest-form">
        <label className="priest-field">
          <span className="priest-label">Your name</span>
          <input
            className="intention-input"
            value={priestName}
            onChange={(e) => setPriestName(e.target.value)}
            aria-label="Your name"
            maxLength={60}
          />
        </label>

        <label className="priest-field">
          <span className="priest-label">Their first name</span>
          <input
            className="intention-input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g. Sarah"
            aria-label="The parishioner's first name"
            maxLength={40}
          />
        </label>

        <label className="priest-field">
          <span className="priest-label">Their phone number</span>
          <input
            className="intention-input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. (555) 123-4567"
            aria-label="The parishioner's phone number"
            inputMode="tel"
          />
        </label>

        <div className="priest-field">
          <span className="priest-label">Message preview</span>
          <textarea
            className="intention-input priest-preview"
            value={message}
            readOnly
            rows={4}
            aria-label="The message that will be sent"
          />
        </div>

        <button className="btn btn-primary priest-send" onClick={send} disabled={!ready}>
          Send
        </button>
        {copied && (
          <p className="priest-copied" role="status">
            Message copied. Paste it into a text to {firstName.trim() || "them"}.
          </p>
        )}
      </section>
    </main>
  );
}
