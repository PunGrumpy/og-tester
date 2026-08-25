"use client";

import { track } from "@databuddy/sdk/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, m } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useDraftStore } from "@/hooks/use-draft-store";
import { DURATION, transition } from "@/lib/motion";
import { normalizeDomain } from "@/lib/reports/domain";

// Validate the raw string rather than piping through `transform`, so the
// refinement always reports against the `url` field.
const schema = z.object({
  url: z
    .string()
    .min(1, "Enter a URL, for example example.com")
    .refine(
      (value) => normalizeDomain(value) !== null,
      "Enter a valid URL, for example example.com"
    ),
});

type SchemaType = z.infer<typeof schema>;

/**
 * The one entry point to the tool, and nothing more than a way in: it resolves
 * what was typed to a canonical domain and hands off to that domain's report,
 * which is where scanning and rendering actually happen. Keeping the work
 * there is what makes a report a URL someone can send to a colleague.
 */
export const InputForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<SchemaType>({
    defaultValues: { url: "" },
    resolver: zodResolver(schema),
  });

  // Published on every keystroke so the header's command reads as the one you
  // are about to run. Watching rather than writing from `onChange` keeps this
  // true however the value got there — a paste, autofill, or a reset.
  const url = form.watch("url");
  const setInput = useDraftStore((state) => state.setInput);
  useEffect(() => {
    setInput(url);
  }, [setInput, url]);

  const onSubmit = (data: SchemaType) => {
    const domain = normalizeDomain(data.url);
    if (!domain) {
      form.setError("url", {
        message: "Enter a valid URL, for example example.com",
        type: "manual",
      });
      return;
    }
    track("submit_url", { url: domain });
    startTransition(() => router.push(`/scan/${domain}`));
  };

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              {/* Held narrower than the headline above it: a URL field as wide
                  as the measure reads as a search bar for the page. */}
              <div className="mx-auto flex w-full min-w-0 max-w-[620px] gap-2.5">
                <div className="relative min-w-0 flex-1">
                  <FormLabel className="sr-only">Website URL</FormLabel>
                  {/* FormControl must wrap the input itself so that
                      aria-invalid / aria-describedby land on the control. */}
                  <FormControl>
                    <Input
                      autoCapitalize="none"
                      autoComplete="url"
                      autoCorrect="off"
                      // `md:text-[15px]` because the shared Input carries
                      // `md:text-sm`, which otherwise wins over `sm:` at
                      // desktop widths and renders the field a pixel smaller
                      // than the button.
                      className="h-13 rounded-md bg-background px-4 text-base shadow-none transition-colors hover:border-foreground/40 sm:text-[15px] md:text-[15px]"
                      enterKeyHint="go"
                      inputMode="url"
                      placeholder="example.com"
                      spellCheck={false}
                      type="text"
                      {...field}
                    />
                  </FormControl>
                </div>

                {/* The spinner covers the label rather than joining it, so the
                    button never resizes mid-request and the label never
                    changes — a control that renames itself reads as a
                    different control. */}
                <button
                  className="relative inline-flex h-13 shrink-0 items-center justify-center rounded-md border border-primary bg-primary px-5 font-medium text-[15px] text-primary-foreground transition-opacity hover:opacity-85 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:px-7"
                  disabled={isPending}
                  type="submit"
                >
                  <span className={isPending ? "opacity-0" : undefined}>
                    Test
                  </span>
                  <AnimatePresence initial={false}>
                    {isPending ? (
                      <m.span
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                        exit={{ opacity: 0, scale: 0.25 }}
                        initial={{ opacity: 0, scale: 0.25 }}
                        key="spinner"
                        transition={transition(DURATION.fast)}
                      >
                        <Spinner aria-hidden="true" className="size-4" />
                      </m.span>
                    ) : null}
                  </AnimatePresence>
                </button>
              </div>
              <FormMessage className="mx-auto w-full max-w-[620px] text-left" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
