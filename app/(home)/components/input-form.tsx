'use client'

import { track } from '@databuddy/sdk/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send } from 'lucide-react'
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

const schema = z.object({
  url: z.url()
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
        setResult(form.getValues('url'), data)
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
    <Section className="p-8">
      <Form {...form}>
        <form
          className="w-full space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="flex space-x-2">
                <div className="flex flex-1 flex-col gap-2">
                  <FormControl>
                    <Input
                      className="bg-background!"
                      placeholder="Enter a URL (e.g., pungrumpy.com)"
                      type="url"
                      {...field}
                      onChange={e => {
                        field.onChange(e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </div>
                <Button
                  className="hover:cursor-pointer"
                  disabled={isExecuting}
                  type="submit"
                >
                  {isExecuting ? (
                    <Spinner className="size-4" />
                  ) : (
                    <Send className="size-4" />
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
