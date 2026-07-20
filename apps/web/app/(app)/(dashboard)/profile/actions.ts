"use server"

import { api } from "@/lib/api/api"

export async function logoutAction() {
  try {
    await api.post("/auth/logout", {})
    return { success: true }
  } catch (error: any) {
    const message = error?.message || "Failed to logout"
    return { success: false, error: message }
  }
}

export async function getVapidPublicKeyAction() {
  try {
    const data = await api.get<{ publicKey: string }>(
      "/notifications/vapid-public-key"
    )
    return { success: true, data: data.publicKey }
  } catch (error: any) {
    const message = error?.message || "Failed to get VAPID public key"
    return { success: false, error: message }
  }
}

export async function subscribeNotificationAction(subscription: {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}) {
  try {
    await api.post("/notifications/subscribe", subscription)
    return { success: true }
  } catch (error: any) {
    const message = error?.message || "Failed to subscribe to notifications"
    return { success: false, error: message }
  }
}

export async function unsubscribeNotificationAction(endpoint: string) {
  try {
    await api.post("/notifications/unsubscribe", { endpoint })
    return { success: true }
  } catch (error: any) {
    const message = error?.message || "Failed to unsubscribe from notifications"
    return { success: false, error: message }
  }
}

export async function sendTestNotificationAction() {
  try {
    await api.post("/notifications/test", {})
    return { success: true }
  } catch (error: any) {
    const message = error?.message || "Failed to send test notification"
    return { success: false, error: message }
  }
}

export async function getNotificationSubscriptionsAction() {
  try {
    const data = await api.get<Array<{ endpoint: string }>>(
      "/notifications/subscriptions"
    )
    return { success: true, data }
  } catch (error: any) {
    const message = error?.message || "Failed to get subscriptions"
    return { success: false, error: message }
  }
}
