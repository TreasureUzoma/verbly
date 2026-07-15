import { z } from "zod"
export const envSchema = z.object({
  API_BASE: z.url().default("http://localhost:3000/api"),
})

export const env = envSchema.parse(process.env)
