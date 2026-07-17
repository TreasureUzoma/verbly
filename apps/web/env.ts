import { z } from "zod"
export const envSchema = z.object({
  NEXT_PUBLIC_API_BASE: z.string().optional(),
  API_BASE: z.string().optional(),
})

export const env = envSchema.parse(process.env)
