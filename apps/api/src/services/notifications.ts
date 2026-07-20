import { eq, and } from "drizzle-orm"
import { db } from "../db/index.js"
import { pushSubscriptions } from "../db/schema.js"
import webpush from "web-push"
import { env } from "../env.js"

// Configure web-push with VAPID keys
if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && env.VAPID_SUBJECT) {
  webpush.setVapidDetails(
    env.VAPID_SUBJECT,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  )
}

export class NotificationsService {
  // Subscribe a user to push notifications
  static async subscribe(
    userId: string,
    subscription: {
      endpoint: string
      keys: {
        p256dh: string
        auth: string
      }
    }
  ) {
    // Check if subscription already exists
    const existing = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
      .limit(1)

    if (existing.length > 0) {
      // Update existing subscription
      const [updated] = await db
        .update(pushSubscriptions)
        .set({
          userId,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          updatedAt: new Date(),
        })
        .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
        .returning()
      return updated
    }

    // Create new subscription
    const [newSubscription] = await db
      .insert(pushSubscriptions)
      .values({
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      })
      .returning()

    return newSubscription
  }

  // Unsubscribe a user from push notifications
  static async unsubscribe(userId: string, endpoint: string) {
    await db
      .delete(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, userId),
          eq(pushSubscriptions.endpoint, endpoint)
        )
      )
  }

  // Get all subscriptions for a user
  static async getUserSubscriptions(userId: string) {
    return await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId))
  }

  // Send a notification to a user
  static async sendNotification(
    userId: string,
    payload: {
      title: string
      body: string
      icon?: string
      badge?: string
      data?: any
    }
  ) {
    const subscriptions = await this.getUserSubscriptions(userId)

    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            JSON.stringify(payload)
          )
          return { success: true, endpoint: subscription.endpoint }
        } catch (error: any) {
          // If subscription is no longer valid, remove it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await db
              .delete(pushSubscriptions)
              .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
          }
          return { success: false, endpoint: subscription.endpoint, error }
        }
      })
    )

    return results
  }

  // Send notification to multiple users
  static async sendNotificationToUsers(
    userIds: string[],
    payload: {
      title: string
      body: string
      icon?: string
      badge?: string
      data?: any
    }
  ) {
    const results = await Promise.all(
      userIds.map((userId) => this.sendNotification(userId, payload))
    )
    return results.flat()
  }

  // Send daily word reminder to all subscribed users
  static async sendDailyWordReminder(word: string, definition: string) {
    const subscriptions = await db.select().from(pushSubscriptions)

    const uniqueUsers = [...new Set(subscriptions.map((s) => s.userId))]

    return await this.sendNotificationToUsers(uniqueUsers, {
      title: `📚 Word of the Day: ${word}`,
      body: definition,
      icon: "/icon-192.png",
      badge: "/badge-72.png",
      data: {
        url: "/home",
        type: "daily-word",
      },
    })
  }
}
