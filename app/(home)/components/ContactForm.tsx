'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { HistorySearch } from '@/app/(home)/components/HistorySearch'
import { schema } from '@/app/(home)/schema'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { fetchMetadata, updateHistory } from '@/lib/utils'
import { MetadataAttributes } from '@/types/metadata'
import { HistoryItem } from '@/types/storage'

export const ContactForm = () => {
  const [metadata, setMetadata] = useState<MetadataAttributes | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      url: ''
    }
  })

  useEffect(() => {
    const savedHistory = localStorage.getItem('urlHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const response = await fetchMetadata(data.url)
      setMetadata(response)
      setHistory(updateHistory(history, data.url, response))

      toast.success(`Metadata fetched successfully for ${data.url}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4"
        >
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

      {metadata && (
        <div className="mt-6">
          {metadata.ogTitle}
          {metadata.ogDescription}
        </div>
      )}

      <HistorySearch
        history={history}
        onSelectHistoryItem={item => {
          form.setValue('url', item.url)
          onSubmit({ url: item.url })
        }}
        onDeleteHistoryItem={url => {
          setHistory(history.filter(item => item.url !== url))
          toast.success('History item deleted')
        }}
      />
    </>
  )
}
