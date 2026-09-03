import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MotionProvider } from "@/components/motion-provider";
import { fonts } from "@/lib/fonts";
import { createMetadata } from "@/lib/metadata";
import { AnalyticsProvider } from "@/providers/analytics";
import { HooksProvider } from "@/providers/hooks";
import { ThemeProvider } from "@/providers/theme";

export const metadata: Metadata = createMetadata(
  "OG Tester",
  "Test your Open Graph metadata with this tool"
);

interface RootLayoutProps {
  readonly children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => (
  <html
    className={fonts}
    lang="en"
    data-scroll-behavior="smooth"
    suppressHydrationWarning
  >
    <body className="antialiased">
      <AnalyticsProvider>
        <MotionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
            enableSystem
          >
            <a
              className="focus:bg-background focus:outline-ring sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-100 focus:rounded-lg focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md focus:outline-2 focus:outline-offset-2"
              href="#content"
            >
              Skip to content
            </a>
            <div className="flex min-h-dvh flex-col">
              <Header />
              <main className="flex-1 scroll-mt-8" id="content">
                {children}
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </MotionProvider>

        <HooksProvider />
      </AnalyticsProvider>
    </body>
  </html>
);

export default RootLayout;
