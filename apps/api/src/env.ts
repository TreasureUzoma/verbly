import { z } from "zod"
import "dotenv/config"

export const envSchema = z.object({
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  APP_URL: z.string(),
  WEB_URL: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  DB_URL: z.string(),
  GROQ_API_KEY: z.string(),
  VAPID_PUBLIC_KEY: z.string(),
  VAPID_PRIVATE_KEY: z.string(),
  VAPID_SUBJECT: z.string(),
})

export const env = envSchema.parse(process.env)
