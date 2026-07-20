import { Hono } from "hono"
import { z } from "zod"
import { NotificationsService } from "../../services/notifications.js"
import type { AuthType, AppBindings } from "../../types.js"
import { env } from "../../env.js"

const notificationsRoute = new Hono<AppBindings>()

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

// Get VAPID public key
notificationsRoute.get("/vapid-public-key", (c) => {
  return c.json({ publicKey: env.VAPID_PUBLIC_KEY })
})

// Subscribe to push notifications
notificationsRoute.post("/subscribe", async (c) => {
  const user = c.get("user") as AuthType
  const requestBody = await c.req.json().catch(() => null)
  const parsedRequest = subscribeSchema.safeParse(requestBody)

  if (!parsedRequest.success) {
    return c.json({ message: "Invalid subscription data." }, 400)
  }

  try {
    const subscription = await NotificationsService.subscribe(
      user.id,
      parsedRequest.data
    )
    return c.json({ success: true, data: subscription })
  } catch (error) {
    console.error("Error subscribing to notifications:", error)
    return c.json({ message: "Failed to subscribe to notifications." }, 500)
  }
})

// Unsubscribe from push notifications
notificationsRoute.post("/unsubscribe", async (c) => {
  const user = c.get("user") as AuthType
  const requestBody = await c.req.json().catch(() => null)
  const endpoint = requestBody?.endpoint

  if (!endpoint) {
    return c.json({ message: "Endpoint is required." }, 400)
  }

  try {
    await NotificationsService.unsubscribe(user.id, endpoint)
    return c.json({ success: true })
  } catch (error) {
    console.error("Error unsubscribing from notifications:", error)
    return c.json({ message: "Failed to unsubscribe from notifications." }, 500)
  }
})

// Get user's subscriptions
notificationsRoute.get("/subscriptions", async (c) => {
  const user = c.get("user") as AuthType

  try {
    const subscriptions = await NotificationsService.getUserSubscriptions(
      user.id
    )
    return c.json({ success: true, data: subscriptions })
  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return c.json({ message: "Failed to fetch subscriptions." }, 500)
  }
})

// Test notification (for development)
notificationsRoute.post("/test", async (c) => {
  const user = c.get("user") as AuthType

  try {
    const results = await NotificationsService.sendNotification(user.id, {
      title: "Test Notification",
      body: "This is a test notification from Verbly!",
      icon: "/icon-192.png",
      data: { url: "/home" },
    })
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error sending test notification:", error)
    return c.json({ message: "Failed to send test notification." }, 500)
  }
})

export default notificationsRoute
