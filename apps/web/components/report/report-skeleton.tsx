import { Container } from "@/components/layout";
import { CATEGORY_META } from "@/lib/reports/verdict";

/**
 * What the shell prerenders while the domain is still unknown.
 *
 * The four categories and the points each is worth are the same on every
 * report, so they are real content rather than a placeholder shape — only the
 * score against them waits on the scan. The heights match `ReportSummary`, so
 * the figures arriving fills the frame instead of moving it.
 */
export const ReportSkeleton = () => (
  <div className="py-12">
    <Container className="grid gap-10 border-b pb-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
      <div aria-hidden="true" className="min-w-0 lg:min-h-[22rem]" />

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
