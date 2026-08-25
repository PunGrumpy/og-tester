"use client";

import { Container } from "@/components/layout";
import { cn } from "@/lib/utils";

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
        <output className="text-muted-foreground block font-mono text-xs">
          {active ? (
            <span className="shimmer">
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
