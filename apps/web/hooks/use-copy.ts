"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CopyState = "idle" | "copied" | "failed";

const legacyCopy = (text: string): boolean => {
  try {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "0";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    // biome-ignore lint/suspicious/noDocumentCookie: not cookies — execCommand
    const ok = document.execCommand("copy");
    field.remove();
    return ok;
  } catch {
    return false;
  }
};

export const useCopy = (resetMs = 2000) => {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    []
  );

  const copy = useCallback(
    async (text: string) => {
      let ok = false;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          ok = true;
        }
      } catch {
        ok = false;
      }
      if (!ok) {
        ok = legacyCopy(text);
      }

      setState(ok ? "copied" : "failed");
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => setState("idle"), resetMs);
      return ok;
    },
    [resetMs]
  );

  return { copy, state };
};
