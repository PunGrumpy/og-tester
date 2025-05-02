import { z } from 'zod'

const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/

export const schema = z.object({
  url: z
    .string()
    .min(1)
    .refine(
      val => {
        return urlPattern.test(val)
      },
      {
        message: 'Please enter a valid URL'
      }
    )
})
