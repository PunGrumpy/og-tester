import { Section } from "@/components/section";
import { ViewAnimation } from "@/components/view-animation";
import { STAGGER } from "@/lib/motion";
import { cn } from "@/lib/utils";

export const Hero = () => (
  <Section
    className={cn(
      "p-6 py-12 sm:py-0 sm:aspect-3/1",
      "flex items-center justify-center",
      "pattern-background bg-foreground/2"
    )}
  >
    <div className="flex flex-col items-center justify-center gap-6">
      <ViewAnimation delay={0}>
        <h1 className="text-balance text-center font-semibold text-4xl xs:text-5xl md:text-7xl">
          Open Graph Tester
        </h1>
      </ViewAnimation>
      <ViewAnimation delay={STAGGER}>
        <p className="max-w-2xl text-pretty text-center text-base sm:text-lg text-muted-foreground">
          Test and preview your Open Graph and Twitter Card metadata. See how
          your links will appear when shared on social media platforms.
        </p>
      </ViewAnimation>
    </div>
  </Section>
);
