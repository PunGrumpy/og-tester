import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type EyebrowProps = HTMLAttributes<HTMLSpanElement>;

/**
 * Mono, uppercase, letter-spaced micro-label used to mark sections.
 * Inspired by the Geist / Vercel and Evil Rabbit grid aesthetic.
 */
export const Eyebrow = ({ className, children, ...props }: EyebrowProps) => (
  <span
    className={cn(
      "font-mono text-[0.7rem] uppercase leading-none tracking-[0.18em] text-muted-foreground",
      className
    )}
    {...props}
  >
    {children}
  </span>
);
