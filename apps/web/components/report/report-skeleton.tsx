import { Container } from "@/components/layout";
import { CATEGORY_META } from "@/lib/reports/verdict";

import { PendingScore, SUMMARY_GRID, SUMMARY_MAIN } from "./pending-score";

export const ReportSkeleton = () => (
  <div className="py-12">
    <Container className={SUMMARY_GRID}>
      <div className={SUMMARY_MAIN}>
        <PendingScore caption="Final score appears once the report loads." />
      </div>

      <ul className="m-0 min-w-0 list-none divide-y border-y p-0 lg:grid lg:min-h-[18rem] lg:grid-rows-4">
        {CATEGORY_META.map(({ id, label, max }) => (
          <li key={id}>
            <div className="grid h-full gap-1 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <span className="text-foreground block font-medium">{label}</span>
              <span className="text-muted-foreground text-sm tabular-nums sm:justify-self-end">
                {`— / ${max}`}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Container>
  </div>
);
