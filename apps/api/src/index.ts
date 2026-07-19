import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import authRoute from "./routes/api/auth.js"
import wordsRoute from "./routes/api/words.js"
import profileRoute from "./routes/api/profile.js"
import { env } from "./env.js"
import type { AuthType, AppBindings } from "./types.js"
import type { Context } from "hono"
import { withAuth } from "./middlewares/auth.js"

const app = new Hono()

app.use(logger())

app.notFound((c) => {
  return c.json({ message: "Not Found" }, 404)
})

app.onError((err, c) => {
  const isDev = process.env.NODE_ENV === "development"
  return c.json(
    {
      success: false,
      message: isDev ? err.message : "Internal server error",
      data: null,
    },
    500
  )
})

app.get("/", (c) => {
  return c.json({
    message: "Hello Nerd, Verbly API is powered by HonoJs :)",
  })
})

const api = new Hono<AppBindings>().basePath("/api/v1")

app.use(
  "/api/*",
  cors({
    origin: (origin) => origin,
    credentials: true,
  })
)

api.route("/auth", authRoute)

// requires auth sessions
api.use("*", withAuth)

api.get("/session", (c: Context<AppBindings>) => {
  const user = c.get("user") as AuthType | undefined
  return c.json({
    success: true,
    data: user,
    message: "Fetched User Session Successfully",
  })
})

api.route("/words", wordsRoute)
api.route("/profile", profileRoute)

app.route("/", api)

export default app

if (!process.env.VERCEL) {
  serve(
    {
      fetch: app.fetch,
      port: 5000,
    },
    (info) => {
      console.log(`Server is running on http://localhost:${info.port}`)
    }
  )
}
