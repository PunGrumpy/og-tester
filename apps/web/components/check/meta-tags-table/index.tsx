"use client";

import { Check, Copy, Edit3 } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ViewAnimation } from "@/components/view-animation";
import { useOgStore } from "@/hooks/use-og-store";
import type { OgData } from "@/lib/schemas/og";
import { cn } from "@/lib/utils";

import { IconsPanel } from "./icons-panel";
import { TagTable } from "./tag-table";

const CATEGORIES = [
  { id: "general", label: "General" },
  { id: "openGraph", label: "Open Graph" },
  { id: "twitter", label: "Twitter" },
  { id: "icons", label: "Icons" },
] as const;

const generateHtml = (data: OgData): string => {
  const lines: string[] = [];

  if (data.title) {
    lines.push(`<title>${data.title}</title>`);
  }

  const addMeta = (
    nameAttr: string,
    nameValue: string,
    content: string | undefined
  ) => {
    if (content) {
      lines.push(`<meta ${nameAttr}="${nameValue}" content="${content}" />`);
    }
  };

  // General
  addMeta("name", "description", data.description);
  addMeta("name", "author", data.author);
  addMeta("name", "viewport", data.viewport);
  addMeta("name", "robots", data.robots);
  addMeta("name", "keywords", data.keywords);
  addMeta("name", "theme-color", data.themeColor);

  // Open Graph
  addMeta("property", "og:title", data["og:title"]);
  addMeta("property", "og:description", data["og:description"]);
  addMeta("property", "og:image", data["og:image"]);
  addMeta("property", "og:url", data["og:url"]);
  addMeta("property", "og:type", data["og:type"]);
  addMeta("property", "og:site_name", data["og:site_name"]);
  addMeta("property", "og:locale", data["og:locale"]);

  // Twitter
  addMeta("name", "twitter:card", data["twitter:card"]);
  addMeta("name", "twitter:title", data["twitter:title"]);
  addMeta("name", "twitter:description", data["twitter:description"]);
  addMeta("name", "twitter:image", data["twitter:image"]);
  addMeta("name", "twitter:site", data["twitter:site"]);
  addMeta("name", "twitter:creator", data["twitter:creator"]);

  return lines.join("\n");
};

export const MetaTagsTable = ({ delay = 0.8 }: { delay?: number }) => {
  const { data, isEditing, setIsEditing, isLoading } = useOgStore();
  const [isCopied, setIsCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("general");

  const handleCopy = () => {
    if (!data) {
      return;
    }
    const html = generateHtml(data);
    navigator.clipboard.writeText(html);
    toast.success("Copied HTML to clipboard");

    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <ViewAnimation
      className="flex h-full flex-col"
      delay={delay}
      initial={{ opacity: 0, translateY: -8 }}
      whileInView={{ opacity: 1, translateY: 0 }}
    >
      <div className="flex items-center justify-end border-b px-4 py-3">
        <div className="flex shrink-0 items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={isEditing}
              disabled={!data || Object.keys(data).length === 0}
              id="edit-mode"
              onCheckedChange={setIsEditing}
            />
            <Label
              className="flex cursor-pointer items-center gap-1.5 font-medium text-sm"
              htmlFor="edit-mode"
            >
              <Edit3 className="size-3.5" />
              Edit
            </Label>
          </div>
          <Button
            className="relative h-8 w-28 overflow-hidden"
            disabled={!data || Object.keys(data).length === 0}
            onClick={handleCopy}
            size="sm"
            variant="outline"
          >
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-[opacity,filter,transform] duration-200 ease-out-custom",
                isCopied
                  ? "opacity-100 blur-0"
                  : "pointer-events-none opacity-0 blur-xs"
              )}
            >
              <Check className="mr-1.5 size-3.5" />
              Copied!
            </div>
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-[opacity,filter,transform] duration-200 ease-out-custom",
                isCopied
                  ? "pointer-events-none opacity-0 blur-xs"
                  : "opacity-100 blur-0"
              )}
            >
              <Copy className="mr-1.5 size-3.5" />
              Copy HTML
            </div>
          </Button>
        </div>
      </div>

      <Tabs
        className="flex h-full flex-col"
        value={activeCategory}
        onValueChange={setActiveCategory}
      >
        <div className="border-b">
          <div className="hide-scrollbar flex-1">
            <TabsList className="h-auto w-max justify-start gap-0 rounded-none bg-transparent p-0 sm:w-auto">
              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  className="relative flex whitespace-nowrap rounded-none border-transparent border-y-0 px-8! py-3 first:border-l-0 last:border-r-0 text-muted-foreground hover:text-foreground transition-colors duration-150 ease-out-custom data-[state=active]:border-transparent! data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground"
                  key={cat.id}
                  value={cat.id}
                >
                  {cat.label}
                  {activeCategory === cat.id && (
                    <m.div
                      layoutId="active-meta-tab-line"
                      className="absolute -bottom-px left-0 right-0 h-[2px] bg-foreground z-10"
                      transition={{
                        damping: 30,
                        stiffness: 380,
                        type: "spring",
                      }}
                    />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        <div className="relative flex-1">
          <AnimatePresence mode="wait">
            {activeCategory === "general" && (
              <TabsContent value="general" forceMount asChild>
                <m.div
                  key="general"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                >
                  <TagTable
                    category="general"
                    data={data}
                    isLoading={isLoading}
                  />
                </m.div>
              </TabsContent>
            )}
            {activeCategory === "openGraph" && (
              <TabsContent value="openGraph" forceMount asChild>
                <m.div
                  key="openGraph"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                >
                  <TagTable
                    category="openGraph"
                    data={data}
                    isLoading={isLoading}
                  />
                </m.div>
              </TabsContent>
            )}
            {activeCategory === "twitter" && (
              <TabsContent value="twitter" forceMount asChild>
                <m.div
                  key="twitter"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                >
                  <TagTable
                    category="twitter"
                    data={data}
                    isLoading={isLoading}
                  />
                </m.div>
              </TabsContent>
            )}
            {activeCategory === "icons" && (
              <TabsContent value="icons" forceMount asChild>
                <m.div
                  key="icons"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                >
                  <IconsPanel data={data} isLoading={isLoading} />
                </m.div>
              </TabsContent>
            )}
          </AnimatePresence>
        </div>
      </Tabs>
    </ViewAnimation>
  );
};
