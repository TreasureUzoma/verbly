import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { logger } from "hono/logger"

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

const api = new Hono().basePath("/api")

app.route("/", api)

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)
