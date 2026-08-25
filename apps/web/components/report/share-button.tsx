"use client";

import { Check, X } from "lucide-react";

import { useCopy } from "@/hooks/use-copy";

/**
 * The chain glyph the reference uses — two links parting — rather than a
 * generic external-link arrow, because the button hands over a URL rather than
 * navigating to one.
 */
const LinkGlyph = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="14"
    viewBox="0 0 16 16"
    width="14"
  >
    <path
      d="M6.75 9.25 9.25 6.75M8.75 4.75l1-1a2.5 2.5 0 0 1 3.54 3.54l-1 1M7.25 11.25l-1 1a2.5 2.5 0 0 1-3.54-3.54l1-1"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

const LABEL = {
  copied: "Copied",
  failed: "Press ⌘C",
  idle: "Share",
} as const;

/**
 * The report's URL is the shareable artefact, so the control that hands it
 * over sits next to the heading rather than being left implicit in the address
 * bar. `-my-2` keeps the 36px button from pushing the baseline it shares with
 * the domain beside it.
 */
export const ShareButton = () => {
  const { copy, state } = useCopy();

  return (
    <button
      className="-my-2 inline-flex h-9 shrink-0 items-center gap-2 self-center rounded-full border bg-background px-3 text-[13px] text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none active:scale-[0.98] active:bg-muted"
      onClick={() => copy(window.location.href)}
      type="button"
    >
      {LABEL[state]}
      {/* Icon trails the word, as in the reference: the label is what you read
          first and the glyph confirms it. */}
      <span aria-hidden="true" className="shrink-0">
        {state === "copied" && <Check className="size-3.5" />}
        {state === "failed" && <X className="size-3.5" />}
        {state === "idle" && <LinkGlyph />}
      </span>
      <span aria-live="polite" className="sr-only">
        {state === "copied" ? "Link copied" : ""}
        {state === "failed"
          ? "Could not copy. Select the address bar and press ⌘C."
          : ""}
      </span>
    </button>
  );
};
