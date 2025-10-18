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

type InputFormProps = {
  onMetadataUpdate: (metadata: Metadata) => void
  fetchMetadata: (url: string) => Promise<Metadata>
  updateHistory: (url: string, metadata: Metadata) => void
}

const worldWideWeb = /^www\./

export const InputForm = ({
  onMetadataUpdate,
  fetchMetadata,
  updateHistory
}: InputFormProps) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { url: '' }
  })

  const normalizeUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace(worldWideWeb, '')
    } catch {
      return url
    }
  }

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      let formattedUrl = data.url.trim()
      if (
        !(
          formattedUrl.startsWith('http://') ||
          formattedUrl.startsWith('https://')
        )
      ) {
        formattedUrl = `https://${formattedUrl}`
      }
      const response = await fetchMetadata(formattedUrl)
      onMetadataUpdate(response)
      updateHistory(formattedUrl, response)
      toast.success(`Metadata fetched successfully for ${formattedUrl}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  return (
    <Form {...form}>
      <form className="w-full space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem className="flex space-x-2">
              <div className="flex-1">
                <Input
                  className="bg-background"
                  placeholder="Enter a URL (e.g. pungrumpy.com)"
                  {...field}
                  onChange={e => {
                    const normalizedUrl = normalizeUrl(e.target.value)
                    field.onChange(normalizedUrl)
                  }}
                />
                <FormMessage />
              </div>
              <Button
                className="hover:cursor-pointer"
                disabled={form.formState.isSubmitting}
                type="submit"
              >
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
