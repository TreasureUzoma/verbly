import { z } from "zod"
export const envSchema = z.object({
  // add client-accessible env vars here
})

export const env = envSchema.parse(process.env)
