import { Eyebrow } from "@/components/eyebrow";
import { Section } from "@/components/section";
import { ViewAnimation } from "@/components/view-animation";
import { cn } from "@/lib/utils";

export const Hero = () => (
  <Section
    corners
    className={cn(
      "relative isolate select-none overflow-hidden",
      "grid-fade bg-foreground/[0.015]",
      "flex flex-col items-center justify-center gap-6",
      "px-4 py-20 sm:py-28 md:py-36"
    )}
  >
    <ViewAnimation
      delay={0.2}
      initial={{ opacity: 0, translateY: -8 }}
      whileInView={{ opacity: 1, translateY: 0 }}
    >
      <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 backdrop-blur-sm">
        <span aria-hidden="true" className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75 motion-reduce:animate-none" />
          <span className="relative inline-flex size-1.5 rounded-full bg-success" />
        </span>
        <Eyebrow>Open Graph · Twitter Cards</Eyebrow>
      </span>
    </ViewAnimation>

    <ViewAnimation
      delay={0.5}
      initial={{ opacity: 0, translateY: -8 }}
      whileInView={{ opacity: 1, translateY: 0 }}
    >
      <h1 className="max-w-3xl text-balance text-center font-semibold text-5xl tracking-tighter md:text-7xl">
        Open Graph Tester
      </h1>
    </ViewAnimation>

    <ViewAnimation
      delay={0.8}
      initial={{ opacity: 0, translateY: -8 }}
      whileInView={{ opacity: 1, translateY: 0 }}
    >
      <p className="max-w-xl text-pretty text-center text-lg text-muted-foreground">
        Test and preview your Open Graph and Twitter Card metadata. See exactly
        how your links appear when shared across social platforms.
      </p>
    </ViewAnimation>
  </Section>
);
