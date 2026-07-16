import { z } from "zod"
export const envSchema = z.object({
  API_BASE: z.url().default("http://localhost:5000/api/v1"),
})

export const env = envSchema.parse(process.env)
