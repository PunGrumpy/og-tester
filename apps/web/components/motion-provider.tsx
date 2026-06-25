"use client";

import { domMax, LazyMotion } from "motion/react";
import type { ReactNode } from "react";

export const MotionProvider = ({ children }: { children: ReactNode }) => (
  <LazyMotion features={domMax}>{children}</LazyMotion>
);
