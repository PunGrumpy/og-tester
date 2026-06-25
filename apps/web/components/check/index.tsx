"use client";

import { Section } from "@/components/section";
import { useScannerStore } from "@/hooks/use-scanner-store";

import { InputForm } from "./input-form";
import { MetaTagsTable } from "./meta-tags-table";
import { SocialPreview } from "./social-preview";

export const CheckerSection = () => {
  const isLoading = useScannerStore((state) => state.isLoading);
  const startScan = useScannerStore((state) => state.startScan);

  return (
    <>
      <div id="checker" className="scroll-mt-24">
        <InputForm onScanSite={startScan} isDisabled={isLoading} delay={1.4} />
      </div>
      <Section className="grid min-h-[420px] gap-0 grid-cols-1 lg:grid-cols-[1fr_420px] divide-y lg:divide-y-0 lg:divide-x">
        <MetaTagsTable delay={1.6} />
        <SocialPreview delay={1.8} />
      </Section>
    </>
  );
};
