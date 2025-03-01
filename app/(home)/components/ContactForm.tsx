'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

import { schema } from '@/app/(home)/schema'
import type { Metadata } from '@/app/api/og/route'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

interface ContactFormProps {
  onMetadataUpdate: (metadata: Metadata) => void
  fetchMetadata: (url: string) => Promise<Metadata>
  updateHistory: (url: string, metadata: Metadata) => void
}

export const ContactForm = ({
  onMetadataUpdate,
  fetchMetadata,
  updateHistory
}: ContactFormProps) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      url: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const formattedUrl = data.url.startsWith('http')
        ? data.url
        : `https://${data.url}`
      const response = await fetchMetadata(formattedUrl)
      onMetadataUpdate(response)
      updateHistory(formattedUrl, response)

      toast.success(`Metadata fetched successfully for ${formattedUrl}`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An error occurred'
      toast.error(message)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter a URL (e.g. pungrumpy.com)"
                  className="bg-background"
                  {...field}
                />
                <FormMessage />
              </div>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Search'
                )}
              </Button>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
