import { z } from "zod"
export const envSchema = z.object({
  NEXT_PUBLIC_API_BASE: z.url(),
})

export const env = envSchema.parse(process.env)
