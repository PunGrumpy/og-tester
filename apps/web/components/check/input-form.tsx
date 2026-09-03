"use client";

import { track } from "@databuddy/sdk/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, m } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useDraftStore } from "@/hooks/use-draft-store";
import { DURATION, transition } from "@/lib/motion";
import { normalizeDomain } from "@/lib/reports/domain";

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

export const InputForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const errorId = useId();

  const form = useForm<SchemaType>({
    defaultValues: { url: "" },
    resolver: zodResolver(schema),
  });

  const url = useWatch({ control: form.control, name: "url" });
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
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <Controller
        control={form.control}
        name="url"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <div className="mx-auto flex w-full max-w-155 min-w-0 gap-2.5">
              <div className="relative min-w-0 flex-1">
                <FieldLabel className="sr-only" htmlFor={field.name}>
                  Website URL
                </FieldLabel>
                <Input
                  aria-describedby={fieldState.invalid ? errorId : undefined}
                  aria-invalid={fieldState.invalid}
                  autoCapitalize="none"
                  autoComplete="url"
                  autoCorrect="off"
                  className="border-foreground/45 bg-background hover:border-foreground/60 h-13 rounded-md px-4 text-base shadow-none transition-colors sm:text-[15px] md:text-[15px]"
                  enterKeyHint="go"
                  id={field.name}
                  inputMode="url"
                  placeholder="example.com"
                  spellCheck={false}
                  type="text"
                  {...field}
                />
              </div>

              <button
                className="border-primary bg-primary text-primary-foreground focus-visible:ring-ring/50 relative inline-flex h-13 shrink-0 items-center justify-center rounded-md border px-5 text-[15px] font-medium transition-opacity hover:opacity-85 focus-visible:ring-[3px] focus-visible:outline-none active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 sm:px-7"
                disabled={isPending}
                type="submit"
              >
                <span className={isPending ? "opacity-0" : undefined}>
                  Analyze
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
            {fieldState.invalid ? (
              <FieldError
                className="mx-auto w-full max-w-155 text-start"
                errors={[fieldState.error]}
                id={errorId}
              />
            ) : null}
          </Field>
        )}
      />
    </form>
  );
};
