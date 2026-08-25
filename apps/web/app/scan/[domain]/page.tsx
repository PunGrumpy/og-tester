import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReportShell } from "@/components/report/report-shell";
import { createMetadata } from "@/lib/metadata";
import { domainToUrl, normalizeDomain } from "@/lib/reports/domain";
import { getReport } from "@/lib/reports/store";

interface ScanPageProps {
  params: Promise<{ domain: string }>;
}

// A report is a snapshot of someone else's site, so it is rendered per request
// rather than baked at build time.
export const dynamic = "force-dynamic";

export const generateMetadata = async ({
  params,
}: ScanPageProps): Promise<Metadata> => {
  const { domain: raw } = await params;
  const domain = normalizeDomain(decodeURIComponent(raw));
  if (!domain) {
    return createMetadata(
      "Report not found | OG Tester",
      "That does not look like a domain we can scan. Enter a site like example.com to see its metadata report."
    );
  }

  const stored = await getReport(domain);
  const description = stored
    ? `${domain} scores ${stored.report.averageScore} out of 100 across ${stored.report.totalPages} pages.`
    : `Open Graph, Twitter Card and SEO tags across ${domain}.`;

  return createMetadata(`${domain} | OG Tester`, description);
};

const ScanPage = async ({ params }: ScanPageProps) => {
  const { domain: rawDomain } = await params;
  const domain = normalizeDomain(decodeURIComponent(rawDomain));

  if (!domain) {
    notFound();
  }

  const stored = await getReport(domain);

  return (
    // Keyed by domain so a different report is a different instance. The
    // shell guards its start-up effect with a ref that survives a prop
    // change, so a reused instance would show the previous domain's data.
    <ReportShell
      domain={domain}
      key={domain}
      siteUrl={domainToUrl(domain)}
      stored={stored && { og: stored.og, report: stored.report }}
    />
  );
};

export default ScanPage;
