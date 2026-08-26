import { InputForm } from "@/components/check/input-form";
import { PixelCycle } from "@/components/pixel-cycle";

export const Hero = () => (
  <section className="mx-auto w-full max-w-[760px] px-5 pt-16 text-center sm:px-8 sm:pt-24">
    <h1 className="text-4xl leading-[1.05] font-semibold tracking-[-0.04em] text-balance sm:text-5xl md:text-[54px]">
      See how your <PixelCycle>links</PixelCycle> look when shared
    </h1>

    <p className="max-w-measure text-muted-foreground mx-auto mt-4 mb-10 text-lg text-balance">
      Enter a URL to read its Open Graph, Twitter Card and SEO tags, preview the
      result on six platforms, then audit every page we can reach.
    </p>

    <InputForm />
  </section>
);
