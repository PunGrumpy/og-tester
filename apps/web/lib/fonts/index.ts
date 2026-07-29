import { Geist } from "next/font/google";
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

export const fonts = cn(
  GeistSans.variable,
  MartianMono.variable,
  "touch-manipulation font-sans antialiased"
);
