"use client";

import { AnimatePresence, m } from "motion/react";
import type { ReactNode } from "react";

import { DURATION, transition } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface StateIconProps {
  /** Changing this cross-fades the old icon out and the new one in. */
  state: string;
  className?: string;
  children: ReactNode;
}

/**
 * A fixed-size slot whose icon changes with `state`: scale 0.25 to 1 and
 * opacity 0 to 1, the same treatment as the submit spinner. The slot keeps
 * its size throughout, so the label beside it never shifts.
 */
export const StateIcon = ({ state, className, children }: StateIconProps) => (
  <span
    aria-hidden="true"
    className={cn(
      "relative inline-flex size-4 shrink-0 items-center justify-center",
      className
    )}
  >
    <AnimatePresence initial={false}>
      <m.span
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0 flex items-center justify-center"
        exit={{ opacity: 0, scale: 0.25 }}
        initial={{ opacity: 0, scale: 0.25 }}
        key={state}
        transition={transition(DURATION.fast)}
      >
        {children}
      </m.span>
    </AnimatePresence>
  </span>
);
