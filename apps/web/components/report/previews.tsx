"use client";

import { m } from "motion/react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import { Icons } from "@/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OgStatus } from "@/hooks/use-og-store";
import { useOgStore } from "@/hooks/use-og-store";
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
  // The bare host is what a platform shows under a card. Falling back to the
  // raw string keeps something on screen if it ever stops being a URL.
  displayUrl: normalizeDomain(url) ?? url,
  image: toImageSrc(data["og:image"] || data["twitter:image"]),
  siteName: data["og:site_name"],
  title: data["og:title"] || data["twitter:title"] || data.title || "No title",
});

type Preview = ReturnType<typeof getPreviewData>;

const PLATFORMS = [
  {
    icon: Icons.x,
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
    icon: Icons.slack,
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
    icon: Icons.facebook,
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
    icon: Icons.linkedin,
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
    icon: Icons.discord,
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
    icon: Icons.whatsapp,
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

/**
 * A failed fetch is not an empty page. Rendering a card from nothing would
 * show a preview of a site we never read, so the failure says so instead and
 * names the way out.
 */
const PreviewBody = ({
  status,
  errorMessage,
  preview,
  render,
}: {
  status: OgStatus;
  errorMessage: string;
  preview: Preview;
  render: (p: Preview) => ReactNode;
}) => {
  if (status === "loading") {
    return (
      <p className="py-8 text-muted-foreground text-sm">
        Reading the page’s tags…
      </p>
    );
  }
  if (status === "error") {
    return (
      <div className="grid gap-1 py-8">
        <p className="font-medium text-foreground text-sm">
          Could not read this page
        </p>
        <p className="max-w-md text-pretty text-muted-foreground text-sm">
          {`${errorMessage} Rescan above once the page responds.`}
        </p>
      </div>
    );
  }
  return <>{render(preview)}</>;
};

/**
 * What the link actually looks like, directly under the score — for a tool
 * about link previews this is the answer the reader came for, and everything
 * below it is the explanation.
 *
 * Tabbed rather than stacked precisely because it sits this high: six cards in
 * a column run past two thousand pixels and push the findings off the page,
 * where one card and a switcher keeps the rest of the report within reach.
 */
export const Previews = () => {
  const url = useOgStore((state) => state.url);
  const data = useOgStore((state) => state.data);
  const status = useOgStore((state) => state.status);
  const errorMessage = useOgStore((state) => state.errorMessage);
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
        {/* The rule belongs to the strip, not to this box: an `overflow-x`
            scroller is a vertical scroller too (CSS turns the other axis from
            `visible` into `auto`), so anything drawn past the bottom edge —
            such as the underline riding the rule — makes it scroll up and
            down. With the border inside, the box is exactly as tall as its
            content and only ever scrolls sideways. */}
        <div className="hide-scrollbar overflow-x-auto">
          <TabsList
            className="w-max min-w-full justify-start gap-7 rounded-none border-b p-0 group-data-[orientation=horizontal]/tabs:h-auto"
            variant="line"
          >
            {PLATFORMS.map(({ icon: Icon, id, label }) => (
              <TabsTrigger
                // `after:hidden` turns off the component's own line-variant
                // underline. It is drawn 5px below the trigger to clear the
                // list's usual 3px padding, which this strip does not have —
                // so it sat detached from the rule, and doubled the animated
                // underline below.
                className="relative flex-none gap-2 whitespace-nowrap rounded-none border-0 bg-transparent px-0 pt-0.5 pb-3 font-mono text-muted-foreground text-sm shadow-none transition-colors after:hidden hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                key={id}
                value={id}
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                {label}
                {active === id && (
                  <m.span
                    className="absolute right-0 -bottom-px left-0 h-px bg-foreground"
                    layoutId="active-preview-tab"
                    transition={transition(DURATION.fast)}
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Every platform gets a panel so each trigger's `aria-controls`
            resolves; Radix renders only the selected one's contents. */}
        {PLATFORMS.map(({ id, render }) => (
          <TabsContent className="pt-6" key={id} value={id}>
            <div className="max-w-md">
              <PreviewBody
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
