import type { ReactNode } from "react";

import { Container } from "@/components/layout";
import type { Standing } from "@/lib/reports/verdict";
import { STANDING_GLYPH, STANDING_TEXT } from "@/lib/reports/verdict";
import { cn } from "@/lib/utils";

interface ReportSectionProps {
  /** Doubles as the anchor the summary's category rows link to. */
  id: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}

/**
 * Every block of a report has the same shape: a heading, a sentence saying
 * what it covers, and a ruled list under both. One component so the findings,
 * the pages, the previews and the tags cannot drift apart.
 */
export const ReportSection = ({
  id,
  title,
  description,
  children,
}: ReportSectionProps) => (
  <section
    aria-labelledby={`${id}-title`}
    className="scroll-mt-8 py-12"
    id={id}
  >
    <Container className="grid gap-5">
      <header className="grid gap-1">
        <h2
          className="text-balance font-semibold text-xl tracking-tight"
          id={`${id}-title`}
        >
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-muted-foreground text-sm leading-6">
            {description}
          </p>
        ) : null}
      </header>
      {children}
    </Container>
  </section>
);

/** A row in one of those lists: glyph, what it is about, trailing figure. */
export const ROW_CLASS =
  "grid gap-2 py-5 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:items-center";

/**
 * Decorative: every row carrying one also spells its standing out in words, so
 * the reading never rests on the hue.
 */
export const StandingGlyph = ({ standing }: { standing: Standing }) => (
  <span
    aria-hidden="true"
    className={cn("font-mono text-lg", STANDING_TEXT[standing])}
  >
    {STANDING_GLYPH[standing]}
  </span>
);
