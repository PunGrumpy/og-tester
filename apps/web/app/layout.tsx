import "./globals.css";
import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MotionProvider } from "@/components/motion-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fonts } from "@/lib/fonts";
import { createMetadata } from "@/lib/metadata";
import { AnalyticsProvider } from "@/providers/analytics";
import { HooksProvider } from "@/providers/hooks";
import { ThemeProvider } from "@/providers/theme";

export const metadata: Metadata = createMetadata(
  "OG Tester",
  "Test your Open Graph metadata with this tool"
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
              <TooltipProvider delayDuration={0}>
                <a
                  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:font-medium focus:text-sm focus:shadow-md focus:outline-2 focus:outline-ring focus:outline-offset-2"
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
              </TooltipProvider>

              <Toaster />
            </ThemeProvider>
          </MotionProvider>

          <HooksProvider />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
