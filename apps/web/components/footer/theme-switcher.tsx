"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { m } from "motion/react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { DURATION, transition } from "@/lib/motion";
import { cn } from "@/lib/utils";

const THEMES = [
  { icon: Monitor, key: "system", label: "System theme" },
  { icon: Sun, key: "light", label: "Light theme" },
  { icon: Moon, key: "dark", label: "Dark theme" },
] as const;

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const isMounted = useSyncExternalStore(
    () => () => true,
    () => true,
    () => false
  );

  if (!isMounted) {
    // The mounted control's footprint, so the footer does not shift on hydration.
    return <div aria-hidden="true" className="h-9 w-25" />;
  }

  return (
    <fieldset
      aria-label="Theme selection"
      className="bg-background/30 ring-border relative flex h-9 items-center rounded-full border-none p-0.5 ring-1"
    >
      {THEMES.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key;

        return (
          <button
            aria-label={label}
            aria-pressed={isActive}
            className="focus-visible:ring-ring/50 relative flex size-8 items-center justify-center rounded-full focus-visible:ring-[3px] focus-visible:outline-none"
            key={key}
            onClick={() => setTheme(key)}
            type="button"
          >
            {isActive ? (
              <m.div
                className="bg-muted/50 ring-border absolute inset-0 rounded-full ring-1"
                id="theme-switcher-indicator"
                layoutId="active-theme"
                transition={transition(DURATION.base)}
              />
            ) : null}
            <Icon
              aria-hidden="true"
              className={cn(
                "relative size-4",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </fieldset>
  );
};
