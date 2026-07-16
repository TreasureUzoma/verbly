import { z } from "zod"
export const envSchema = z.object({})

export const env = envSchema.parse(process.env)
