import { Geist, Geist_Mono, Geist_Pixel } from "next/font/google";

import { cn } from "./utils";

const GeistSans = Geist({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-sans",
});

const GeistMono = Geist_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-mono",
});

const GeistPixel = Geist_Pixel({
  axes: ["ELSH"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist-pixel",
  weight: "variable",
});

export const fonts = cn(
  GeistSans.variable,
  GeistMono.variable,
  GeistPixel.variable,
  "touch-manipulation font-sans antialiased"
);
