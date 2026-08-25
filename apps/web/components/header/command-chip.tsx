"use client";

import { Check, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { useCopy } from "@/hooks/use-copy";
import { useDraftStore } from "@/hooks/use-draft-store";
import { normalizeDomain } from "@/lib/reports/domain";

const BASE = "npx og-tester";

/** Two offset sheets, drawn to sit with 13px type at a 1.5 stroke. */
const CopyGlyph = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="16"
    viewBox="0 0 18 18"
    width="16"
  >
    <rect
      height="9.5"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      width="9.5"
      x="6"
      y="6"
    />
    <path
      d="M12 6V4a1.5 1.5 0 0 0-1.5-1.5h-6A1.5 1.5 0 0 0 3 4v6A1.5 1.5 0 0 0 4.5 11H6"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

/**
 * The same check, one shell command away. The whole chip is the button — the
 * text is the payload, so there is no smaller target to hunt for.
 *
 * On a report the argument comes from the path, which is right on the first
 * render and reproduces what is on screen. Anywhere else it follows the entry
 * field as it is typed, so the command is always the one you are about to run
 * rather than a placeholder you have to fill in yourself.
 */
export const CommandChip = () => {
  const pathname = usePathname();
  const routeDomain = pathname?.startsWith("/scan/")
    ? normalizeDomain(decodeURIComponent(pathname.slice("/scan/".length)))
    : null;
  const draft = useDraftStore((state) => state.input).trim();

  // Canonical once what is typed resolves to a domain, raw while it is still
  // being typed — so the argument tracks every keystroke but firms up, in
  // wording and in colour, at the moment the input becomes something we could
  // actually scan.
  const resolved = routeDomain ?? normalizeDomain(draft);
  const argument = resolved ?? draft;
  const command = argument ? `${BASE} ${argument}` : BASE;

  const { copy, state } = useCopy();

  return (
    <button
      aria-label={`Copy command: ${command}`}
      className="group ml-auto hidden h-9 min-w-0 max-w-[min(60%,26rem)] items-center gap-2.5 rounded-full border bg-card px-3 text-left transition-colors hover:border-foreground/25 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none sm:flex dark:hover:bg-muted"
      onClick={() => copy(command)}
      type="button"
    >
      <code className="truncate font-mono text-[13px] text-foreground">
        {/* Decoration: it marks this as a shell line, and reading it aloud
            would only add "dollar" to the label above. */}
        <span aria-hidden="true" className="text-muted-foreground/60">
          ${" "}
        </span>
        {BASE}{" "}
        <span className={resolved ? undefined : "text-muted-foreground"}>
          {argument || "[url]"}
        </span>
      </code>

      <span
        aria-hidden="true"
        className="shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
      >
        {state === "copied" && <Check className="size-4" />}
        {state === "failed" && <X className="size-4" />}
        {state === "idle" && <CopyGlyph />}
      </span>

      {/* Only a failure earns a visible word: it is the one outcome the icon
          alone leaves you guessing at, and it names the way out. */}
      {state === "failed" && (
        <span className="shrink-0 text-muted-foreground text-xs">Press ⌘C</span>
      )}

      <span aria-live="polite" className="sr-only">
        {state === "copied" ? "Command copied" : ""}
        {state === "failed"
          ? "Could not copy. Select the command and press ⌘C."
          : ""}
      </span>
    </button>
  );
};
