import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ReportSectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * One heading + content primitive for every block in the scanner report.
 * Grouping comes from space and a heading rather than a card border, so the
 * report nests at most one box deep.
 */
export const ReportSection = ({
  title,
  description,
  action,
  children,
  className,
}: ReportSectionProps) => (
  <section className={cn("flex min-w-0 flex-col gap-3", className)}>
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
        {description ? (
          <p className="text-pretty text-muted-foreground text-xs">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
    {children}
  </section>
);
