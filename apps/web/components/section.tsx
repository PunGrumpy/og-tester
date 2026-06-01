import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const PlusMark = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={cn(
      "pointer-events-none absolute z-20 hidden size-2.5 text-foreground/25 md:block",
      className
    )}
    fill="none"
    viewBox="0 0 10 10"
  >
    <path d="M5 0v10M0 5h10" stroke="currentColor" strokeWidth="1" />
  </svg>
);

/**
 * Evil Rabbit-style corner crosses that mark the intersections of the
 * framed content column. Aligned to the section's vertical borders.
 */
const Corners = () => (
  <>
    <PlusMark className="-left-[5px] -top-[5px]" />
    <PlusMark className="-right-[5px] -top-[5px]" />
    <PlusMark className="-bottom-[5px] -left-[5px]" />
    <PlusMark className="-bottom-[5px] -right-[5px]" />
  </>
);

type SectionProps = HTMLAttributes<HTMLDivElement> & {
  corners?: boolean;
};

export const Section = ({
  children,
  className,
  corners,
  ...props
}: SectionProps) => (
  <section {...props}>
    <div className="relative mx-auto max-w-6xl">
      {corners ? <Corners /> : null}
      <div className={cn("md:border-x", className)}>{children}</div>
    </div>
  </section>
);

type SectionSeparator = HTMLAttributes<HTMLDivElement>;

export const SectionSeparator = ({
  children,
  className,
  ...props
}: SectionSeparator) => (
  <section {...props}>
    <div className="relative mx-auto max-w-6xl">
      <div className={cn("dash-background h-8 md:border-x", className)}>
        {children}
      </div>
    </div>
  </section>
);
