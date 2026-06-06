/**
 * Builds a calendar file (.ics) of daily recurring prayer reminders, each with
 * a built-in alert. The person adds it once; their device's own Calendar/Clock
 * then fires the alarm every day — no server, works offline, iPhone and Android.
 */

type Reminders = { morning: string | null; evening: string | null };

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Floating local time, e.g. 20251225T070000 — recurs at the local clock time. */
function localStamp(d: Date): string {
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}00`
  );
}

/** UTC stamp for DTSTAMP, e.g. 20251225T120000Z. */
function utcStamp(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function vevent(uid: string, summary: string, time: string, now: Date): string {
  const [h, m] = time.split(":").map(Number);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
  if (start.getTime() <= now.getTime()) start.setDate(start.getDate() + 1);
  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART:${localStamp(start)}`,
    "RRULE:FREQ=DAILY",
    `SUMMARY:${summary}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${summary}`,
    "TRIGGER:-PT0M",
    "END:VALARM",
    "END:VEVENT",
  ].join("\r\n");
}

export function buildReminderIcs(reminders: Reminders, now = new Date()): string {
  const events: string[] = [];
  if (reminders.morning) {
    events.push(vevent("morning@prayer-app", "Morning Prayer", reminders.morning, now));
  }
  if (reminders.evening) {
    events.push(vevent("evening@prayer-app", "Evening Prayer", reminders.evening, now));
  }
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Prayer App//Reminders//EN",
    "CALSCALE:GREGORIAN",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Trigger a download / calendar-import of the given .ics content. */
export function downloadIcs(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
