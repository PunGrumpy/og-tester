"use client";

import { useMemo } from "react";

import { Icons } from "@/components/icons";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ViewAnimation } from "@/components/view-animation";
import { useOgStore } from "@/hooks/use-og-store";
import type { OgData } from "@/lib/schemas/og";

import { DiscordPreview } from "./discord-preview";
import { FacebookPreview } from "./facebook-preview";
import { LinkedinPreview } from "./linkedin-preview";
import { SlackPreview } from "./slack-preview";
import { WhatsappPreview } from "./whatsapp-preview";
import { XPreview } from "./x-preview";

const PLATFORMS = [
  { icon: Icons.x, id: "x", label: "Twitter/X" },
  { icon: Icons.slack, id: "slack", label: "Slack" },
  { icon: Icons.facebook, id: "facebook", label: "Facebook" },
  { icon: Icons.linkedin, id: "linkedin", label: "LinkedIn" },
  { icon: Icons.discord, id: "discord", label: "Discord" },
  { icon: Icons.whatsapp, id: "whatsapp", label: "WhatsApp" },
] as const;

const PROTOCOL_REGEX = /^[a-zA-Z]+:\/\//u;
const WWW_REGEX = /^www\./u;
const SPLIT_HOST_REGEX = /[/?#]/u;

const parseDisplayUrl = (url: string) => {
  const trimmed = url.trim();

  const withoutProtocol = trimmed.replace(PROTOCOL_REGEX, "");
  const withoutWww = withoutProtocol.replace(WWW_REGEX, "");
  const [hostname] = withoutWww.split(SPLIT_HOST_REGEX);

  return hostname;
};

const getPreviewData = (data: OgData | null, url: string) => ({
  description:
    data?.["og:description"] ||
    data?.["twitter:description"] ||
    data?.description,
  displayUrl: parseDisplayUrl(url),
  image: data?.["og:image"] || data?.["twitter:image"],
  siteName: data?.["og:site_name"],
  title:
    data?.["og:title"] || data?.["twitter:title"] || data?.title || "No title",
});

export const SocialPreview = () => {
  const { url, data } = useOgStore();
  const preview = useMemo(() => getPreviewData(data, url), [data, url]);
  const hasData = Boolean(url && data);

  return (
    <ViewAnimation
      className="flex flex-col gap-4 p-4"
      delay={0.8}
      initial={{ opacity: 0, translateY: -8 }}
      whileInView={{ opacity: 1, translateY: 0 }}
    >
      <Tabs defaultValue="x">
        <TabsList className="h-10 gap-1">
          {PLATFORMS.map(({ id, icon: Icon, label }) => (
            <TabsTrigger aria-label={label} key={id} value={id}>
              <Icon />
            </TabsTrigger>
          ))}
        </TabsList>

        {hasData ? (
          <>
            <TabsContent value="x">
              <XPreview
                description={preview.description}
                displayUrl={preview.displayUrl}
                image={preview.image}
                title={preview.title}
              />
            </TabsContent>
            <TabsContent value="slack">
              <SlackPreview
                description={preview.description}
                image={preview.image}
                siteName={preview.siteName}
                title={preview.title}
              />
            </TabsContent>
            <TabsContent value="facebook">
              <FacebookPreview
                description={preview.description}
                displayUrl={preview.displayUrl}
                image={preview.image}
                title={preview.title}
              />
            </TabsContent>
            <TabsContent value="linkedin">
              <LinkedinPreview
                displayUrl={preview.displayUrl}
                image={preview.image}
                title={preview.title}
              />
            </TabsContent>
            <TabsContent value="discord">
              <DiscordPreview
                description={preview.description}
                image={preview.image}
                siteName={preview.siteName}
                title={preview.title}
              />
            </TabsContent>
            <TabsContent value="whatsapp">
              <WhatsappPreview
                description={preview.description}
                displayUrl={preview.displayUrl}
                image={preview.image}
                title={preview.title}
              />
            </TabsContent>
          </>
        ) : (
          <Empty className="mt-4 flex-1 border">
            <EmptyHeader>
              <EmptyTitle>No preview available</EmptyTitle>
              <EmptyDescription>
                Enter a URL above to see how your link will appear on social
                media.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </Tabs>
    </ViewAnimation>
  );
};
