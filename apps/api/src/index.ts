import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import authRoute from "./routes/api/auth.js"
import { env } from "./env.js"
import type { AuthType } from "./types.js"
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

const api = new Hono().basePath("/api/v1")

api.use(
  "/*",
  cors({
    origin: env.WEB_URL,
    credentials: true,
  })
)

api.route("/auth", authRoute)

// requires auth sessions
api.use("*", withAuth)

api.get("/session", (c: Context) => {
  const user = c.get("user") as AuthType | undefined
  return c.json({
    success: true,
    data: user,
    message: "Fetched User Session Successfully",
  })
})

app.route("/", api)

serve(
  {
    fetch: app.fetch,
    port: 5000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)
