import { Geist, Geist_Pixel } from "next/font/google";
import localFont from "next/font/local";

import { cn } from "../utils";

const GeistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});
// Only the regular face ships, so declare it accurately rather than letting
// the @font-face claim weights the family does not have. Any `font-bold` on
// mono text is browser-synthesized until a bold face is added here.
const MartianMono = localFont({
  display: "swap",
  src: "./MartianMono-Regular.woff2",
  style: "normal",
  variable: "--font-mono",
  weight: "400",
});

/**
 * Geist Pixel, for the one word in the hero that changes shape.
 *
 * `ELSH` is the family's element-shape axis: 0 draws each pixel as a filled
 * square and 100 as a bare line, with everything between it. One variable face
 * therefore covers what used to be five static ones here — and because the
 * axis is continuous, the word can move through the shapes rather than cutting
 * between them.
 */
const GeistPixel = Geist_Pixel({
  axes: ["ELSH"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist-pixel",
  weight: "variable",
});

export const fonts = cn(
  GeistSans.variable,
  MartianMono.variable,
  GeistPixel.variable,
  "touch-manipulation font-sans antialiased"
);
