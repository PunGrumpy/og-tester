import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ReportShell } from "@/components/report/report-shell";
import { ReportSkeleton } from "@/components/report/report-skeleton";
import { createMetadata } from "@/lib/metadata";
import { domainToUrl, normalizeDomain } from "@/lib/reports/domain";
import { getReport } from "@/lib/reports/store";

interface ScanPageProps {
  params: Promise<{ domain: string }>;
}

export const generateMetadata = async ({
  params,
}: ScanPageProps): Promise<Metadata> => {
  const { domain: raw } = await params;
  const domain = normalizeDomain(decodeURIComponent(raw));
  if (!domain) {
    return {
      ...createMetadata(
        "Report not found | OG Tester",
        "That does not look like a domain we can scan. Enter a site like example.com to see its metadata report."
      ),
      robots: { index: false },
    };
  }

  const stored = await getReport(domain);
  const description = stored
    ? `${domain} scores ${stored.report.averageScore} out of 100 across ${stored.report.totalPages} pages.`
    : `Open Graph, Twitter Card and SEO tags across ${domain}.`;

  return createMetadata(`${domain} | OG Tester`, description);
};

const Report = async ({ params }: ScanPageProps) => {
  const { domain: rawDomain } = await params;
  const domain = normalizeDomain(decodeURIComponent(rawDomain));

  if (!domain) {
    notFound();
  }

  const stored = await getReport(domain);

  return (
    <ReportShell
      domain={domain}
      key={domain}
      siteUrl={domainToUrl(domain)}
      stored={stored && { og: stored.og, report: stored.report }}
    />
  );
};

const ScanPage = ({ params }: ScanPageProps) => (
  <Suspense fallback={<ReportSkeleton />}>
    <Report params={params} />
  </Suspense>
);

export default ScanPage;
