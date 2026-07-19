import { Hono } from "hono"
import type { AppBindings } from "../../types.js"

const chatRoute = new Hono<AppBindings>()

// Simple streaming endpoint that streams a generated response back to the client.
// This is a stub implementation that streams the response in small chunks.
chatRoute.post("/stream", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}))
    const prompt = (body && body.message) || ""

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        const words = `Response: ${prompt}`.split(/\s+/) || []
        for (const w of words) {
          controller.enqueue(encoder.encode(w + " "))
          // small delay to simulate streaming
          await new Promise((r) => setTimeout(r, 120))
        }
        controller.enqueue(encoder.encode("\n"))
        controller.close()
      },
    })

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    })
  } catch (err) {
    console.error("Chat stream error:", err)
    return c.json({ success: false, message: "Failed to stream chat" }, 500)
  }
})

export default chatRoute
