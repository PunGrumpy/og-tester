import { InputForm } from "@/components/check/input-form";
import { PixelCycle } from "@/components/pixel-cycle";

export const Hero = () => (
  // A narrower column than the lists below it: a headline and one sentence
  // read better short, while a table wants the full width.
  <section className="mx-auto w-full max-w-[760px] px-5 pt-16 text-center sm:px-8 sm:pt-24">
    <h1 className="text-balance font-semibold text-4xl leading-[1.05] tracking-[-0.04em] sm:text-5xl md:text-[54px]">
      See how your <PixelCycle>links</PixelCycle> look when shared
    </h1>

    <p className="mx-auto mt-4 mb-10 max-w-[52ch] text-balance text-lg text-muted-foreground">
      Enter a URL to read its Open Graph, Twitter Card and SEO tags, preview the
      result on six platforms, then audit every page we can reach.
    </p>

    <InputForm />
  </section>
);
