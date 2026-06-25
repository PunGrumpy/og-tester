"use client";

import { track } from "@databuddy/sdk/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Send } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ogAction } from "@/actions/og-action";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ViewAnimation } from "@/components/view-animation";
import { useOgStore } from "@/hooks/use-og-store";
import { parseError } from "@/lib/error";
import { cn } from "@/lib/utils";

const HTTPS_PROTOCOL_REGEX = /^https?:\/\//iu;
const OTHER_PROTOCOL_REGEX = /^[a-z][a-z0-9+.-]*:/iu;

const normalizeUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  // Already has protocol
  if (HTTPS_PROTOCOL_REGEX.test(trimmed)) {
    return trimmed;
  }

  // Has other protocol (ftp, mailto, etc.) - return as-is for validation to fail
  if (OTHER_PROTOCOL_REGEX.test(trimmed)) {
    return trimmed;
  }

  // Auto-prepend https://
  return `https://${trimmed}`;
};

const schema = z.object({
  url: z
    .string()
    .min(1, "Please enter a URL")
    .transform(normalizeUrl)
    .refine((val) => {
      try {
        const _url = new URL(val);
        return !!_url;
      } catch {
        return false;
      }
    }, "Please enter a valid URL"),
});

type SchemaType = z.infer<typeof schema>;

export const InputForm = ({
  onScanSite,
  isDisabled,
  delay = 1.4,
}: {
  onScanSite: (url: string) => void;
  isDisabled: boolean;
  delay?: number;
}) => {
  const { setResult } = useOgStore();
  const form = useForm<SchemaType>({
    defaultValues: { url: "" },
    resolver: zodResolver(schema),
  });
  const { execute, isExecuting } = useAction(ogAction, {
    onError: ({ error }) => {
      if (error.serverError) {
        form.setError("url", {
          message: parseError(error.serverError),
          type: "server",
        });
      }
    },
    onSuccess: ({ data }) => {
      if (data) {
        const normalizedUrl = normalizeUrl(form.getValues("url"));
        setResult(normalizedUrl, data);
      }
    },
  });

  const onSubmit = (data: SchemaType) => {
    track("submit_url", {
      url: data.url.toString(),
    });
    execute({ url: data.url });
    onScanSite(data.url);
  };

  return (
    <Section className="p-4 sm:p-8">
      <ViewAnimation
        delay={delay}
        initial={{ opacity: 0, translateY: -8 }}
        whileInView={{ opacity: 1, translateY: 0 }}
      >
        <Form {...form}>
          <form
            className="w-full flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                  <div className="flex flex-1 flex-col gap-2">
                    <FormControl>
                      <div className="relative">
                        <label className="sr-only" htmlFor="url-input">
                          Website URL
                        </label>
                        <Globe
                          aria-hidden="true"
                          className={cn(
                            "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2",
                            fieldState.error
                              ? "text-destructive"
                              : "text-muted-foreground"
                          )}
                        />
                        <Input
                          autoCapitalize="off"
                          autoComplete="url"
                          autoCorrect="off"
                          className="bg-background pl-9"
                          disabled={isDisabled || isExecuting}
                          enterKeyHint="go"
                          id="url-input"
                          placeholder="example.com"
                          spellCheck={false}
                          type="text"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </div>
                  <Button
                    aria-label={
                      isExecuting ? "Analyzing URL..." : "Analyze URL"
                    }
                    className="w-full sm:w-auto relative min-w-[44px]"
                    disabled={isDisabled || isExecuting}
                    type="submit"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <m.span
                        key={isExecuting ? "loading" : "idle"}
                        initial={{
                          filter: "blur(2px)",
                          opacity: 0,
                          scale: 0.95,
                        }}
                        animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
                        exit={{ filter: "blur(2px)", opacity: 0, scale: 0.95 }}
                        transition={{
                          duration: 0.16,
                          ease: [0.23, 1, 0.32, 1],
                        }}
                        className="inline-flex items-center gap-2 justify-center"
                      >
                        {isExecuting ? (
                          <>
                            <Spinner className="size-4" />
                            <span className="sm:hidden">Analyzing…</span>
                          </>
                        ) : (
                          <>
                            <Send className="size-4" />
                            <span className="sm:hidden">Analyze</span>
                          </>
                        )}
                      </m.span>
                    </AnimatePresence>
                  </Button>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </ViewAnimation>
    </Section>
  );
};
