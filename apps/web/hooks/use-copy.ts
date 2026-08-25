"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CopyState = "idle" | "copied" | "failed";

/**
 * The textarea-and-execCommand dance, kept because it is the only thing that
 * works outside a secure context. `navigator.clipboard` is undefined on plain
 * http — which is every LAN-IP preview and every non-TLS deploy — so a button
 * written against it alone does nothing at all there, silently.
 */
const legacyCopy = (text: string): boolean => {
  try {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    // Off-screen but still selectable; `display: none` cannot be selected, and
    // a fixed position stops the page scrolling on focus.
    field.style.position = "fixed";
    field.style.top = "0";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    // biome-ignore lint/suspicious/noDocumentCookie: not cookies — execCommand
    // is deprecated but has no replacement outside a secure context.
    const ok = document.execCommand("copy");
    field.remove();
    return ok;
  } catch {
    return false;
  }
};

/**
 * One copy primitive for every button that offers one, so they all succeed in
 * the same places and all report the same way.
 */
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
