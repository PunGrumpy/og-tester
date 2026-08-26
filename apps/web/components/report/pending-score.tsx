export const DIAL_SIZE = 104;

export const SUMMARY_GRID =
  "grid gap-10 border-b pb-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]";

export const SUMMARY_MAIN = "min-w-0 lg:min-h-[22rem]";

export const PendingScore = ({ caption }: { caption: string }) => (
  <>
    <div className="mt-6 flex min-h-28 items-center gap-5">
      <svg
        aria-hidden="true"
        className="shrink-0"
        height={DIAL_SIZE}
        viewBox={`0 0 ${DIAL_SIZE} ${DIAL_SIZE}`}
        width={DIAL_SIZE}
      >
        <circle
          className="fill-muted"
          cx={DIAL_SIZE / 2}
          cy={DIAL_SIZE / 2}
          r={DIAL_SIZE / 2}
        />
      </svg>
      <span
        aria-hidden="true"
        className="bg-foreground h-3 w-20 rounded-full"
      />
    </div>
    <p className="text-muted-foreground mt-2 text-sm text-pretty">{caption}</p>
  </>
);
