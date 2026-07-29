"use client";

import { domMax, LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

export const MotionProvider = ({ children }: { children: ReactNode }) => (
  <LazyMotion features={domMax}>
    <MotionConfig reducedMotion="user">{children}</MotionConfig>
  </LazyMotion>
);
