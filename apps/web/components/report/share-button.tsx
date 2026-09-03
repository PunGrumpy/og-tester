"use client";

import { Check, X } from "lucide-react";

import { useCopy } from "@/hooks/use-copy";

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
  failed: "Copy failed",
  idle: "Share",
} as const;

export const ShareButton = () => {
  const { copy, state } = useCopy();

  return (
    <button
      className="bg-background text-muted-foreground hover:border-foreground/25 hover:text-foreground focus-visible:ring-ring/50 active:bg-muted -my-2 inline-flex h-9 shrink-0 items-center gap-2 self-center rounded-full border px-3 text-sm transition-colors focus-visible:ring-[3px] focus-visible:outline-none active:scale-[0.96]"
      onClick={() => copy(window.location.href)}
      type="button"
    >
      {LABEL[state]}
      <span aria-hidden="true" className="shrink-0">
        {state === "copied" && <Check className="size-3.5" strokeWidth={1.5} />}
        {state === "failed" && <X className="size-3.5" strokeWidth={1.5} />}
        {state === "idle" && <LinkGlyph />}
      </span>
      <span aria-live="polite" className="sr-only">
        {state === "copied" ? "Link copied" : ""}
        {state === "failed"
          ? "Could not copy. Copy the address from the address bar."
          : ""}
      </span>
    </button>
  );
};
