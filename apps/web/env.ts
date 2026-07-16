import { z } from "zod"
export const envSchema = z.object({
  NEXT_PUBLIC_API_BASE: z.url().default("https://verbly-api.vercel.app/api/v1"),
})

export const env = envSchema.parse(process.env)
