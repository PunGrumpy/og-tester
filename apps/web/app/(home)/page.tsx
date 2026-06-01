import type { Metadata } from "next";

import { Section, SectionSeparator } from "@/components/section";
import { createMetadata } from "@/lib/metadata";

import { Hero } from "./components/hero";
import { InputForm } from "./components/input-form";
import { MetaTagsTable } from "./components/meta-tags-table";
import { ScreenshotPreview } from "./components/screenshot-preview";
import { SocialPreview } from "./components/social-preview";

export const metadata: Metadata = createMetadata(
  "OG Tester",
  "Test your Open Graph metadata with this tool"
);

const Home = () => (
  <>
    <Hero />
    <SectionSeparator />
    <InputForm />
    <Section className="grid min-h-[420px] gap-0 lg:grid-cols-[1fr_420px] lg:divide-x">
      <MetaTagsTable />
      <SocialPreview />
    </Section>
    <SectionSeparator />
    <Section>
      <ScreenshotPreview />
    </Section>
    <SectionSeparator />
  </>
);

export default Home;
