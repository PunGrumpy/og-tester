'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { schema } from '@/app/(home)/schema'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { fetchMetadata, updateHistory } from '@/lib/utils'
import { MetadataAttributes } from '@/types/metadata'
import { HistoryItem } from '@/types/storage'

interface ContactFormProps {
  onMetadataUpdate: (metadata: MetadataAttributes) => void
  history: HistoryItem[]
  setHistory: (history: HistoryItem[]) => void
}

export const ContactForm = ({
  onMetadataUpdate,
  history,
  setHistory
}: ContactFormProps) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      url: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const response = await fetchMetadata(data.url)
      onMetadataUpdate(response)
      setHistory(updateHistory(history, data.url, response))

      toast.success(`Metadata fetched successfully for ${data.url}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
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
              <Input
                placeholder="Enter a URL (e.g. pungrumpy.com)"
                className="bg-background"
                {...field}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Loading...' : 'Search'}
              </Button>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
