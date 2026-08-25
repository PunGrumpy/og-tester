import { PageSection, SectionHeading } from "@/components/layout";

const COVERAGE = [
  {
    detail: "title, description, image, url, type, site name, locale",
    label: "Open Graph",
    prefix: "og:*",
  },
  {
    detail: "card, title, description, image, site, creator",
    label: "Twitter Card",
    prefix: "twitter:*",
  },
  {
    detail: "title, description, canonical, robots, viewport",
    label: "Core SEO",
    prefix: "meta",
  },
  {
    detail: "reachable, dimensions, file size",
    label: "Image validation",
    prefix: "og:image",
  },
] as const;

export const Coverage = () => (
  <PageSection>
    <SectionHeading
      aside="4 categories"
      description="Every page is scored against these, on the page you enter and across the rest of the site"
      title="What gets checked"
    />
    <div className="mt-3.5 border-t">
      {COVERAGE.map(({ detail, label, prefix }) => (
        // The detail is what makes the row worth reading, so on a narrow
        // viewport it drops to a second line rather than being hidden and
        // leaving a row that says almost nothing.
        <div
          className="flex min-w-0 flex-col items-start gap-1 border-b py-3.5 md:flex-row md:items-center md:gap-4"
          key={label}
        >
          <div className="flex min-w-0 items-baseline gap-3">
            <span className="text-foreground text-sm font-medium">{label}</span>
            <code className="text-muted-foreground font-mono text-xs">
              {prefix}
            </code>
          </div>
          <p className="text-muted-foreground text-xs md:ml-auto md:text-right">
            {detail}
          </p>
        </div>
      ))}
    </div>
  </PageSection>
);
