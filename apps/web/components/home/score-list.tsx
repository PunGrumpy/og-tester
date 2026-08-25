import Link from "next/link";

import { PageSection, SectionHeading } from "@/components/layout";
import type { RecentEntry } from "@/lib/reports/store";

/**
 * The site's own mark, or the globe the route hands back when it has none — a
 * favicon is the fastest way to recognise a domain in a list of them. The
 * fallback is chosen server-side rather than layered behind this image,
 * because a failed `<img>` shows the browser's own broken-image placeholder
 * instead of whatever sits underneath it.
 */
const Favicon = ({ domain }: { domain: string }) => (
  <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full border bg-muted/40">
    {/* The route already returns a favicon-sized icon, so the optimiser would
        be a second round trip for nothing. */}
    {/* oxlint-disable-next-line next/no-img-element */}
    <img
      alt=""
      className="size-[18px] rounded-full object-contain"
      height={18}
      loading="lazy"
      referrerPolicy="no-referrer"
      src={`/api/favicon?host=${encodeURIComponent(domain)}`}
      width={18}
    />
  </span>
);

interface ScoreListProps {
  /** Ties the list to its heading, so the section is named. */
  id: string;
  title: string;
  aside?: string;
  entries: RecentEntry[];
  /** Where the rest of this list lives, when it is only a window onto one. */
  href?: string;
  hrefLabel?: string;
}

/**
 * A domain, its mark and its last known score, as one ruled row per site.
 *
 * The row is a link end to end rather than a link sitting inside a row, so the
 * whole strip is the target and the hover tint says so. Rendering nothing when
 * there is nothing keeps a fresh deployment from showing an empty frame with a
 * heading over it.
 */
export const ScoreList = ({
  id,
  title,
  aside,
  entries,
  href,
  hrefLabel,
}: ScoreListProps) => {
  if (entries.length === 0) {
    return null;
  }

  return (
    <PageSection aria-labelledby={`${id}-title`} className="py-8 sm:py-10">
      <SectionHeading
        aside={
          href && hrefLabel ? (
            <Link
              className="inline-flex min-h-6 items-center text-inherit underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              href={href}
            >
              {hrefLabel}
              <span aria-hidden="true">{" \u2192"}</span>
            </Link>
          ) : (
            aside
          )
        }
        id={`${id}-title`}
        title={title}
      />

      {/* Ordered because the sequence carries meaning in both lists: recent
          runs newest first, featured runs in the order they were picked. */}
      <ol className="m-0 mt-3.5 list-none border-t p-0">
        {entries.map((entry) => (
          <li className="m-0 border-b" key={entry.domain}>
            <Link
              // An inset outline rather than the usual ring: the row runs edge
              // to edge, so a ring drawn outside it would be clipped.
              className="flex items-center gap-3.5 px-2.5 py-3.5 text-inherit transition-colors hover:bg-muted dark:hover:bg-muted/50 focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
              href={`/scan/${entry.domain}`}
            >
              <Favicon domain={entry.domain} />
              <span className="min-w-0 truncate font-medium text-[15px]">
                {entry.domain}
              </span>
              {/* A fixed minimum keeps a two- and a three-digit score in one
                  column rather than letting the shorter one drift left. */}
              <span className="ml-auto min-w-[72px] shrink-0 whitespace-nowrap text-right font-bold font-mono text-base tabular-nums">
                {entry.score}
                <span className="font-normal text-muted-foreground">
                  {" /100"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </PageSection>
  );
};
