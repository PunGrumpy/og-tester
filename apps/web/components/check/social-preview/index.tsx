"use client";

import { AnimatePresence, m } from "motion/react";
import { useMemo, useState } from "react";

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

export const SocialPreview = ({ delay = 0.8 }: { delay?: number }) => {
  const { url, data } = useOgStore();
  const [activePlatform, setActivePlatform] = useState<string>("x");
  const preview = useMemo(() => getPreviewData(data, url), [data, url]);
  const hasData = Boolean(url && data);

  return (
    <ViewAnimation
      className="flex flex-col gap-4 p-4"
      delay={delay}
      initial={{ opacity: 0, translateY: -8 }}
      whileInView={{ opacity: 1, translateY: 0 }}
    >
      <Tabs value={activePlatform} onValueChange={setActivePlatform}>
        <TabsList className="h-10 gap-1">
          {PLATFORMS.map(({ id, icon: Icon, label }) => (
            <TabsTrigger
              aria-label={label}
              key={id}
              value={id}
              className="relative data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-transparent data-[state=active]:text-foreground"
            >
              {activePlatform === id && (
                <m.div
                  layoutId="active-platform-bg"
                  className="absolute inset-0 bg-background dark:bg-muted-foreground/15 rounded-md shadow-2xs border border-border/20 z-0"
                  transition={{ damping: 30, stiffness: 380, type: "spring" }}
                />
              )}
              <span className="relative z-10">
                <Icon />
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {hasData ? (
          <div className="relative mt-4">
            <AnimatePresence mode="wait">
              {activePlatform === "x" && (
                <TabsContent value="x" forceMount asChild>
                  <m.div
                    key="x"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <XPreview
                      description={preview.description}
                      displayUrl={preview.displayUrl}
                      image={preview.image}
                      title={preview.title}
                    />
                  </m.div>
                </TabsContent>
              )}
              {activePlatform === "slack" && (
                <TabsContent value="slack" forceMount asChild>
                  <m.div
                    key="slack"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <SlackPreview
                      description={preview.description}
                      image={preview.image}
                      siteName={preview.siteName}
                      title={preview.title}
                    />
                  </m.div>
                </TabsContent>
              )}
              {activePlatform === "facebook" && (
                <TabsContent value="facebook" forceMount asChild>
                  <m.div
                    key="facebook"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <FacebookPreview
                      description={preview.description}
                      displayUrl={preview.displayUrl}
                      image={preview.image}
                      title={preview.title}
                    />
                  </m.div>
                </TabsContent>
              )}
              {activePlatform === "linkedin" && (
                <TabsContent value="linkedin" forceMount asChild>
                  <m.div
                    key="linkedin"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <LinkedinPreview
                      displayUrl={preview.displayUrl}
                      image={preview.image}
                      title={preview.title}
                    />
                  </m.div>
                </TabsContent>
              )}
              {activePlatform === "discord" && (
                <TabsContent value="discord" forceMount asChild>
                  <m.div
                    key="discord"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <DiscordPreview
                      description={preview.description}
                      image={preview.image}
                      siteName={preview.siteName}
                      title={preview.title}
                    />
                  </m.div>
                </TabsContent>
              )}
              {activePlatform === "whatsapp" && (
                <TabsContent value="whatsapp" forceMount asChild>
                  <m.div
                    key="whatsapp"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <WhatsappPreview
                      description={preview.description}
                      displayUrl={preview.displayUrl}
                      image={preview.image}
                      title={preview.title}
                    />
                  </m.div>
                </TabsContent>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Empty className="mt-4 flex-1 border">
            <EmptyHeader>
              <EmptyTitle className="text-balance">
                No preview available
              </EmptyTitle>
              <EmptyDescription className="text-pretty">
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
