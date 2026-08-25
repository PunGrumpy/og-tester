/**
 * The bordered button this app uses wherever a control is secondary to the one
 * beside it: Try again, Start over, Cancel scan, and the pagination arrows.
 *
 * One string because three copies had already drifted on rounding, padding and
 * hover colour, which made the same control look like three controls depending
 * on which page you reached it from.
 */
export const SECONDARY_BUTTON =
  "inline-flex min-h-9 items-center rounded-md border px-3 text-sm transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none dark:hover:bg-muted/50";
