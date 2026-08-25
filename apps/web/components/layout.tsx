import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The one horizontal frame for the site. Header, hero, results and footer all
 * align to these two edges, so no block introduces a stray alignment edge.
 */
export const Container = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    className={cn("mx-auto w-full max-w-page px-5 sm:px-8", className)}
    {...props}
  />
);

/**
 * Vertical rhythm between top-level blocks. Grouping is carried by space —
 * several times the gap inside a block — rather than by the bordered frames
 * this replaced, so a section draws no rules of its own.
 */
export const PageSection = ({
  children,
  className,
  ...props
}: ComponentProps<"section">) => (
  <section className={cn("py-14 sm:py-20", className)} {...props}>
    <Container>{children}</Container>
  </section>
);

interface SectionHeadingProps {
  title: string;
  description?: string;
  /** Trailing note or control, kept on the heading's baseline. */
  aside?: ReactNode;
  className?: string;
  id?: string;
}

/**
 * A label and an optional trailing note. The rule belongs to the list that
 * follows rather than to the heading, so the rows read as one ruled block
 * beginning under the title instead of the title wearing a rule of its own.
 */
export const SectionHeading = ({
  title,
  description,
  aside,
  className,
  id,
}: SectionHeadingProps) => (
  <div className={cn("flex flex-col gap-0.5", className)}>
    {/* Title and trailing note share one line and the description takes the
          next, rather than all three competing in one wrapping row — where a
          narrow viewport pushed the note under the description and it read as
          a third line of it. */}
    <div className="flex items-baseline justify-between gap-4">
      <h2
        className="m-0 min-w-0 font-semibold text-base text-foreground tracking-tight"
        id={id}
      >
        {title}
      </h2>
      {aside ? (
        <div className="shrink-0 text-muted-foreground text-xs">{aside}</div>
      ) : null}
    </div>
    {description ? (
      <p className="text-pretty text-muted-foreground text-sm">{description}</p>
    ) : null}
  </div>
);
