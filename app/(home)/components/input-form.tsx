'use client'

import { track } from '@databuddy/sdk/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Globe, Send } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ogAction } from '@/actions/og-action'
import { Section } from '@/components/section'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useOgStore } from '@/hooks/use-og-store'
import { parseError } from '@/lib/error'
import { cn } from '@/lib/utils'

const HTTPS_PROTOCOL_REGEX = /^https?:\/\//i
const OTHER_PROTOCOL_REGEX = /^[a-z][a-z0-9+.-]*:/i

const normalizeUrl = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  // Already has protocol
  if (HTTPS_PROTOCOL_REGEX.test(trimmed)) {
    return trimmed
  }

  // Has other protocol (ftp, mailto, etc.) - return as-is for validation to fail
  if (OTHER_PROTOCOL_REGEX.test(trimmed)) {
    return trimmed
  }

  // Auto-prepend https://
  return `https://${trimmed}`
}

const schema = z.object({
  url: z
    .string()
    .min(1, 'Please enter a URL')
    .transform(normalizeUrl)
    .pipe(z.string().url('Please enter a valid URL'))
})

type SchemaType = z.infer<typeof schema>

export const InputForm = () => {
  const { setResult } = useOgStore()
  const form = useForm<SchemaType>({
    resolver: zodResolver(schema),
    defaultValues: { url: '' }
  })
  const { execute, isExecuting } = useAction(ogAction, {
    onSuccess: ({ data }) => {
      if (data) {
        const normalizedUrl = normalizeUrl(form.getValues('url'))
        setResult(normalizedUrl, data)
      }
    },
    onError: ({ error }) => {
      if (error.serverError) {
        form.setError('url', {
          type: 'server',
          message: parseError(error.serverError)
        })
      }
    }
  })

  const onSubmit = (data: SchemaType) => {
    track('submit_url', {
      url: data.url.toString()
    })
    execute({ url: data.url })
  }

  return (
    <Section className="p-4 sm:p-8">
      <Form {...form}>
        <form
          className="w-full space-y-4"
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
                          'pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2',
                          fieldState.error
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                        )}
                      />
                      <Input
                        autoCapitalize="off"
                        autoComplete="url"
                        autoCorrect="off"
                        className="bg-background pl-9"
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
                  aria-label={isExecuting ? 'Testing URL...' : 'Test URL'}
                  className="w-full sm:w-auto"
                  disabled={isExecuting}
                  type="submit"
                >
                  {isExecuting ? (
                    <>
                      <Spinner className="size-4" />
                      <span className="sm:hidden">Testing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      <span className="sm:hidden">Test URL</span>
                    </>
                  )}
                </Button>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Section>
  )
}
