import Link from "next/link";

import { NewTabHint } from "@/components/new-tab-hint";

const RULES_URL =
  "https://github.com/PunGrumpy/og-tester/blob/main/packages/core/src/scoring/rules.ts";

const SECTIONS = [
  {
    body: [
      "A page starts at 100 points split across four categories: Open Graph is worth 40, Core SEO 25, Twitter Card 20, and og:image validation 15. The weights follow how much each one changes what a reader actually sees when your link is posted — a missing og:title costs you a preview, a missing twitter:creator costs you a byline.",
      "Every category begins at full marks and loses points as checks fail, so the number is a deduction from a working page rather than a tally of features. Sixteen checks run in total: five Open Graph, four Core SEO, three Twitter Card, and four on the image itself. A page that trips none of them scores 100.",
    ],
    title: "What the score measures",
  },
  {
    body: [
      "Deductions are graded by how wrong a tag is, not just whether it exists. A missing og:title costs 10 points; one that is present but too long to survive truncation costs 4. That partial credit is why a page can sit at 88 with nothing obviously broken — it is carrying several small penalties rather than one large one.",
      "Each finding also carries a severity. Errors are tags whose absence breaks the preview outright, warnings degrade it, and info notes are worth fixing but cost little. The figure beside a finding is the points it removed, so the list is already ordered by what it would buy you back.",
    ],
    title: "How a single page is scored",
  },
  {
    body: [
      "A site scan starts from sitemap.xml, keeps the URLs on the same origin, and falls back to following links from the page you entered when no sitemap is published. It reads up to 50 pages, five at a time, and the headline figure is the plain average of their scores.",
      "The individual page scores are usually the more useful read. The Pages list runs lowest first, and a run of similar scores almost always maps to one template rather than to individual pages — a docs layout missing og:image will drag its whole section down together.",
    ],
    title: "How a site is scored",
  },
  {
    body: [
      "Start with the findings, which are grouped by tag and ordered by how many pages each one reaches. A single fix in a shared layout typically moves dozens of pages at once, where the same effort spent on the lowest-scoring individual page moves one. The Pages list below names the tags each URL tripped.",
      "Every finding names the exact tag and the change to make. Copy a prompt turns the whole report into something you can hand to whatever writes your code, and the Previews tabs show what each platform does with the tags as they stand.",
    ],
    title: "How to read a report",
  },
  {
    body: [
      "The scanner reads the HTML your server returns and does not execute JavaScript. Tags injected on the client after load will not appear here — which is the point, because the crawlers building these previews do not run your JavaScript either. If a tag shows up in devtools but not in this report, that difference is the finding.",
      "og:image is fetched so its real pixel dimensions and file size can be read from the bytes, and an image that is slow, blocked, or missing counts as unreachable. Everything else is one snapshot of public pages at one moment, capped at 50. Accessibility, performance, and whether the copy is any good are all outside what this measures.",
    ],
    title: "What it does not cover",
  },
] as const;

const LINK_CLASS =
  "text-inherit underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

export const ScoringGuide = () => (
  <section aria-labelledby="scoring-guide-title" className="py-12 sm:py-16">
    <div className="mx-auto grid w-full max-w-[760px] gap-5 px-5 sm:px-8">
      <h2
        className="text-2xl font-medium tracking-tight"
        id="scoring-guide-title"
      >
        How scoring works
      </h2>

      <div className="grid gap-8">
        {SECTIONS.map(({ body, title }) => (
          <section className="grid gap-3" key={title}>
            <h3 className="text-lg font-medium tracking-tight">{title}</h3>
            {body.map((paragraph) => (
              <p
                className="max-w-measure text-muted-foreground leading-7 text-pretty"
                key={paragraph.slice(0, 32)}
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      <p className="text-muted-foreground text-sm">
        Every weight and threshold above lives in{" "}
        <Link
          className={LINK_CLASS}
          href={RULES_URL}
          prefetch={false}
          rel="noopener noreferrer"
          target="_blank"
        >
          one rules file
          <NewTabHint />
        </Link>
        , and the same checks run in the{" "}
        <Link
          className={LINK_CLASS}
          href="https://www.npmjs.com/package/og-tester"
          prefetch={false}
          rel="noopener noreferrer"
          target="_blank"
        >
          command-line version
          <NewTabHint />
        </Link>
        .
      </p>
    </div>
  </section>
);
