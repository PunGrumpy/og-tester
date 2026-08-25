import type { ReactNode } from "react";

import { Container } from "@/components/layout";
import type { Standing } from "@/lib/reports/verdict";
import { STANDING_GLYPH, STANDING_TEXT } from "@/lib/reports/verdict";
import { cn } from "@/lib/utils";

interface ReportSectionProps {
  id: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}

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
          className="text-xl font-semibold tracking-tight text-balance"
          id={`${id}-title`}
        >
          {title}
        </h2>
        {description ? (
          <p className="max-w-measure text-muted-foreground text-sm leading-6">
            {description}
          </p>
        ) : null}
      </header>
      {children}
    </Container>
  </section>
);

export const ROW_CLASS =
  "grid gap-2 py-5 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:items-center";

export const StandingGlyph = ({ standing }: { standing: Standing }) => (
  <span
    aria-hidden="true"
    className={cn("font-mono text-lg", STANDING_TEXT[standing])}
  >
    {STANDING_GLYPH[standing]}
  </span>
);
