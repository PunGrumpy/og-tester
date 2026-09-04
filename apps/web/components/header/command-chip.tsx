"use client";

import { Check, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { StateIcon } from "@/components/state-icon";
import { useCopy } from "@/hooks/use-copy";
import { useDraftStore } from "@/hooks/use-draft-store";
import { normalizeDomain } from "@/lib/reports/domain";
import { cn } from "@/lib/utils";

const BASE = "npx og-tester";

const CHIP_CLASS =
  "group bg-card ms-auto hidden h-9 max-w-[min(60%,26rem)] min-w-0 items-center gap-2.5 rounded-full border px-3 text-start transition-colors sm:flex";

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

const CommandText = ({
  argument,
  resolved,
}: {
  argument: string;
  resolved: string | null;
}) => (
  <code className="text-foreground truncate font-mono text-sm">
    <span aria-hidden="true" className="text-muted-foreground/60">
      ${" "}
    </span>
    {BASE}{" "}
    <span className={resolved ? undefined : "text-muted-foreground"}>
      {argument || "[url]"}
    </span>
  </code>
);

export const CommandChipFallback = () => (
  <span aria-hidden="true" className={CHIP_CLASS}>
    <CommandText argument="" resolved={null} />
    <span className="text-muted-foreground shrink-0">
      <CopyGlyph />
    </span>
  </span>
);

export const CommandChip = () => {
  const pathname = usePathname();
  const routeDomain = pathname?.startsWith("/scan/")
    ? normalizeDomain(decodeURIComponent(pathname.slice("/scan/".length)))
    : null;
  const draft = useDraftStore((state) => state.input).trim();

  const resolved = routeDomain ?? normalizeDomain(draft);
  const argument = resolved ?? draft;
  const command = argument ? `${BASE} ${argument}` : BASE;

  const { copy, state } = useCopy();

  return (
    <button
      aria-label={`Copy command: ${command}`}
      className={cn(
        CHIP_CLASS,
        "hover:border-foreground/25 focus-visible:ring-ring/50 dark:hover:bg-muted focus-visible:ring-[3px] focus-visible:outline-none"
      )}
      onClick={() => copy(command)}
      type="button"
    >
      <CommandText argument={argument} resolved={resolved} />

      <StateIcon
        className="text-muted-foreground group-hover:text-foreground transition-colors"
        state={state}
      >
        {state === "copied" && <Check className="size-4" strokeWidth={1.5} />}
        {state === "failed" && <X className="size-4" strokeWidth={1.5} />}
        {state === "idle" && <CopyGlyph />}
      </StateIcon>

      {state === "failed" && (
        <span className="text-muted-foreground shrink-0 text-xs">
          Copy failed
        </span>
      )}

      <span aria-live="polite" className="sr-only">
        {state === "copied" ? "Command copied" : ""}
        {state === "failed"
          ? "Could not copy. Select the command and copy it."
          : ""}
      </span>
    </button>
  );
};
