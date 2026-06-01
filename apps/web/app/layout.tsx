import "./globals.css";
import type { Metadata } from "next";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={fonts} lang="en" suppressHydrationWarning>
      <body>
        <AnalyticsProvider>
          <MotionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              disableTransitionOnChange
              enableSystem
            >
              <main className="relative divide-y">
                <Header />
                {children}
                <Footer />
              </main>
            </ThemeProvider>
          </MotionProvider>

          <HooksProvider />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
