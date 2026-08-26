import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const Container = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    className={cn("max-w-page mx-auto w-full px-5 sm:px-8", className)}
    {...props}
  />
);

export const PageSection = ({
  children,
  className,
  ...props
}: ComponentProps<"section">) => (
  <section className={cn("py-14 sm:py-20", className)} {...props}>
    <Container>{children}</Container>
  </section>
);

interface SectionHeadingProps {
  title: string;
  description?: string;
  aside?: ReactNode;
  className?: string;
  id?: string;
}

export const SectionHeading = ({
  title,
  description,
  aside,
  className,
  id,
}: SectionHeadingProps) => (
  <div className={cn("flex flex-col gap-0.5", className)}>
    <div className="flex items-baseline justify-between gap-4">
      <h2
        className="text-foreground m-0 min-w-0 text-base font-semibold tracking-tight"
        id={id}
      >
        {title}
      </h2>
      {aside ? (
        <div className="text-muted-foreground shrink-0 text-xs">{aside}</div>
      ) : null}
    </div>
    {description ? (
      <p className="max-w-measure text-muted-foreground text-sm text-pretty">
        {description}
      </p>
    ) : null}
  </div>
);
