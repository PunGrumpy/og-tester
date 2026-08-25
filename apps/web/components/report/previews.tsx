"use client";

import { m } from "motion/react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import { Icons } from "@/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OgStatus } from "@/hooks/use-og-store";
import { toImageSrc } from "@/lib/image-src";
import { DURATION, transition } from "@/lib/motion";
import { normalizeDomain } from "@/lib/reports/domain";
import type { OgData } from "@/lib/schemas/og";

import { DiscordPreview } from "../check/social-preview/discord-preview";
import { FacebookPreview } from "../check/social-preview/facebook-preview";
import { LinkedinPreview } from "../check/social-preview/linkedin-preview";
import { SlackPreview } from "../check/social-preview/slack-preview";
import { WhatsappPreview } from "../check/social-preview/whatsapp-preview";
import { XPreview } from "../check/social-preview/x-preview";
import { ReportSection } from "./section";

const getPreviewData = (data: OgData, url: string) => ({
  description:
    data["og:description"] || data["twitter:description"] || data.description,
  displayUrl: normalizeDomain(url) ?? url,
  image: toImageSrc(data["og:image"] || data["twitter:image"]),
  siteName: data["og:site_name"],
  title: data["og:title"] || data["twitter:title"] || data.title || "No title",
});

type Preview = ReturnType<typeof getPreviewData>;

const PLATFORMS = [
  {
    icon: Icons.X,
    id: "x",
    label: "X",
    render: (p: Preview) => (
      <XPreview
        description={p.description}
        displayUrl={p.displayUrl}
        image={p.image}
        title={p.title}
      />
    ),
  },
  {
    icon: Icons.Slack,
    id: "slack",
    label: "Slack",
    render: (p: Preview) => (
      <SlackPreview
        description={p.description}
        image={p.image}
        siteName={p.siteName}
        title={p.title}
      />
    ),
  },
  {
    icon: Icons.Facebook,
    id: "facebook",
    label: "Facebook",
    render: (p: Preview) => (
      <FacebookPreview
        description={p.description}
        displayUrl={p.displayUrl}
        image={p.image}
        title={p.title}
      />
    ),
  },
  {
    icon: Icons.Linkedin,
    id: "linkedin",
    label: "LinkedIn",
    render: (p: Preview) => (
      <LinkedinPreview
        displayUrl={p.displayUrl}
        image={p.image}
        title={p.title}
      />
    ),
  },
  {
    icon: Icons.Discord,
    id: "discord",
    label: "Discord",
    render: (p: Preview) => (
      <DiscordPreview
        description={p.description}
        image={p.image}
        siteName={p.siteName}
        title={p.title}
      />
    ),
  },
  {
    icon: Icons.Whatsapp,
    id: "whatsapp",
    label: "WhatsApp",
    render: (p: Preview) => (
      <WhatsappPreview
        description={p.description}
        displayUrl={p.displayUrl}
        image={p.image}
        title={p.title}
      />
    ),
  },
] as const;

type PlatformId = (typeof PLATFORMS)[number]["id"];

const PreviewBody = ({
  canRescan,
  status,
  errorMessage,
  preview,
  render,
}: {
  canRescan: boolean;
  status: OgStatus;
  errorMessage: string;
  preview: Preview;
  render: (p: Preview) => ReactNode;
}) => {
  if (status === "loading") {
    return (
      <p className="text-muted-foreground py-8 text-sm">
        Reading the page’s tags…
      </p>
    );
  }
  if (status === "error") {
    return (
      <div className="grid gap-1 py-8">
        <p className="text-foreground text-sm font-medium">
          Could not read this page
        </p>
        <p className="text-muted-foreground max-w-md text-sm text-pretty">
          {canRescan
            ? `${errorMessage} Rescan above once the page responds.`
            : `${errorMessage} The scan is still running; you can rescan once it finishes.`}
        </p>
      </div>
    );
  }
  return <>{render(preview)}</>;
};

interface PreviewsProps {
  canRescan: boolean;
  data: OgData;
  errorMessage: string;
  status: OgStatus;
  url: string;
}

export const Previews = ({
  canRescan,
  data,
  errorMessage,
  status,
  url,
}: PreviewsProps) => {
  const [active, setActive] = useState<PlatformId>("x");
  const preview = useMemo(() => getPreviewData(data, url), [data, url]);

  return (
    <ReportSection
      description="The same tags as each platform renders them. Built from the page you entered, not from every page in the scan."
      id="previews"
      title="Previews"
    >
      <Tabs
        className="grid gap-0"
        onValueChange={(value) => setActive(value as PlatformId)}
        value={active}
      >
        <div className="hide-scrollbar overflow-x-auto">
          <TabsList
            className="w-max min-w-full justify-start gap-7 rounded-none border-b p-0 group-data-[orientation=horizontal]/tabs:h-auto"
            variant="line"
          >
            {PLATFORMS.map(({ icon: Icon, id, label }) => (
              <TabsTrigger
                className="text-muted-foreground hover:text-foreground relative flex-none gap-2 rounded-none border-0 bg-transparent px-0 pt-0.5 pb-3 font-mono text-sm whitespace-nowrap shadow-none transition-colors after:hidden"
                key={id}
                value={id}
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                {label}
                {active === id && (
                  <m.span
                    className="bg-foreground absolute right-0 -bottom-px left-0 h-px"
                    layoutId="active-preview-tab"
                    transition={transition(DURATION.fast)}
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {PLATFORMS.map(({ id, render }) => (
          // min-w-0: without it a truncated og:title sizes the tabs grid.
          <TabsContent className="min-w-0 pt-6" key={id} value={id}>
            <div className="max-w-md">
              <PreviewBody
                canRescan={canRescan}
                errorMessage={errorMessage}
                preview={preview}
                render={render}
                status={status}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </ReportSection>
  );
};
