"use client";

import { Container } from "@/components/layout";
import { cn } from "@/lib/utils";

/**
 * The line under a report that is being rescanned.
 *
 * It collapses rather than unmounts. A grid row animated between `0fr` and
 * `1fr` is the one way to transition to a height the content decides, and the
 * inner `min-h-0 overflow-hidden` is what lets the row actually clip. Staying
 * mounted also means the live region exists before the text arrives, which is
 * what makes the announcement land.
 */
export const RefreshStatus = ({
  active,
  completed,
  total,
}: {
  active: boolean;
  completed: number;
  total: number;
}) => (
  <Container
    className={cn(
      "grid transition-[grid-template-rows] duration-500 ease-in-out motion-reduce:transition-none",
      active ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
    )}
  >
    <div className="min-h-0 overflow-hidden">
      <div
        className={cn(
          "pt-6 transition-opacity duration-300 motion-reduce:transition-none",
          active ? "opacity-100 delay-150" : "opacity-0"
        )}
      >
        {/* `output` is a polite live region without needing the attribute. */}
        <output className="block font-mono text-muted-foreground text-xs">
          {active ? (
            <span className="waiting-glimmer">
              {total > 0
                ? `Rescanning: ${completed} of ${total} pages. `
                : "Rescanning. "}
              The score shown is from the last completed run.
            </span>
          ) : null}
        </output>
      </div>
    </div>
  </Container>
);
