import type { Tradition } from "../lib/engine";

/**
 * A quiet, monochrome emblem for each tradition — a subtle watermark, never
 * loud. Drawn in currentColor so the surrounding CSS sets tone and opacity.
 */
export function TraditionEmblem({
  tradition,
  className,
}: {
  tradition: Tradition | null;
  className?: string;
}) {
  if (!tradition) return null;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {EMBLEMS[tradition]}
    </svg>
  );
}

const EMBLEMS: Record<Tradition, JSX.Element> = {
  // Plain Latin cross with a Celtic nimbus.
  anglican: (
    <>
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="7" y1="9" x2="17" y2="9" />
      <circle cx="12" cy="9" r="3.4" />
    </>
  ),
  // Three-bar Orthodox cross with slanted footbar.
  "eastern-orthodox": (
    <>
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="9.5" y1="6.5" x2="14.5" y2="6.5" />
      <line x1="7" y1="10" x2="17" y2="10" />
      <line x1="9" y1="17" x2="15" y2="15" />
    </>
  ),
  // An open book.
  evangelical: (
    <>
      <path d="M12 6.5c-2.2-1.6-4.6-1.6-7-0.6v11c2.4-1 4.8-1 7 0.6" />
      <path d="M12 6.5c2.2-1.6 4.6-1.6 7-0.6v11c-2.4-1-4.8-1-7 0.6" />
      <line x1="12" y1="6.5" x2="12" y2="17.5" />
    </>
  ),
  // Plain Latin cross.
  protestant: (
    <>
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="8" y1="8" x2="16" y2="8" />
    </>
  ),
  // Latin cross with a titulus, on a Calvary base.
  "roman-catholic": (
    <>
      <line x1="12" y1="4" x2="12" y2="19" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="10.5" y1="6" x2="13.5" y2="6" />
      <line x1="8.5" y1="19" x2="15.5" y2="19" />
    </>
  ),
};
