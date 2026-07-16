import { z } from "zod"
export const envSchema = z.object({
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_SECRET: z.string(),
})

export const env = envSchema.parse(process.env)
