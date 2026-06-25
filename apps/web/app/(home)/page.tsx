import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckerSection } from "@/components/check";
import { ScannerSection } from "@/components/scan";
import { SectionSeparator } from "@/components/section";
import { createMetadata } from "@/lib/metadata";

import { Hero } from "./components/hero";

export const metadata: Metadata = createMetadata(
  "OG Tester",
  "Test your Open Graph metadata with this tool"
);

const Home = () => (
  <>
    <Hero />
    <SectionSeparator />
    <Suspense
      fallback={
        <div className="h-96 flex items-center justify-center text-muted-foreground animate-pulse text-sm">
          Loading tool suite...
        </div>
      }
    >
      <CheckerSection />
      <ScannerSection />
    </Suspense>
  </>
);

export default Home;
