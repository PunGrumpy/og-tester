import Image from "next/image";
import Link from "next/link";

import { PageSection, SectionHeading } from "@/components/layout";
import type { RecentEntry } from "@/lib/reports/store";

const Favicon = ({ domain }: { domain: string }) => (
  <span className="bg-muted/40 grid size-7 shrink-0 place-items-center overflow-hidden rounded-full border">
    <Image
      alt=""
      className="size-[18px] rounded-full object-contain"
      height={18}
      loading="lazy"
      referrerPolicy="no-referrer"
      src={`/api/favicon?host=${encodeURIComponent(domain)}`}
      unoptimized
      width={18}
    />
  </span>
);

interface ScoreListProps {
  id: string;
  title: string;
  aside?: string;
  entries: RecentEntry[];
  href?: string;
  hrefLabel?: string;
}

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
              className="hover:text-foreground focus-visible:ring-ring/50 inline-flex min-h-6 items-center text-inherit underline-offset-4 transition-colors hover:underline focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:outline-none"
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

      <ol className="m-0 mt-3.5 list-none border-t p-0">
        {entries.map((entry) => (
          <li className="m-0 border-b" key={entry.domain}>
            <Link
              className="hover:bg-muted dark:hover:bg-muted/50 focus-visible:outline-ring flex items-center gap-3.5 px-2.5 py-3.5 text-inherit transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2"
              href={`/scan/${entry.domain}`}
            >
              <Favicon domain={entry.domain} />
              <span className="text-md min-w-0 truncate font-medium">
                {entry.domain}
              </span>
              <span className="ms-auto min-w-[72px] shrink-0 text-end font-mono text-base font-bold whitespace-nowrap tabular-nums">
                {entry.score}
                <span className="text-muted-foreground font-normal">
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
