"use client"

import { useState, useEffect } from "react"
import { Bell, BellSlash } from "@phosphor-icons/react"
import { toast } from "sonner"
import { pushManager } from "@/lib/notifications/push-manager"
import {
  getVapidPublicKeyAction,
  subscribeNotificationAction,
  unsubscribeNotificationAction,
  sendTestNotificationAction,
} from "../actions"

export function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] =
    useState<NotificationPermission>("default")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkSupport = async () => {
      const supported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window

      setIsSupported(supported)

      if (supported) {
        setPermission(Notification.permission)
        await checkSubscription()
      }
    }

    checkSupport()
  }, [])

  const checkSubscription = async () => {
    const subscription = await pushManager.getSubscription()
    setIsSubscribed(!!subscription)
  }

  const handleEnableNotifications = async () => {
    setIsLoading(true)

    try {
      // Initialize service worker
      const initialized = await pushManager.initialize()
      if (!initialized) {
        toast.error("Failed to initialize notifications")
        return
      }

      // Request permission
      const newPermission = await pushManager.requestPermission()
      setPermission(newPermission)

      if (newPermission !== "granted") {
        toast.error("Notification permission denied")
        return
      }

      // Get VAPID public key from API via server action
      const vapidResult = await getVapidPublicKeyAction()
      if (!vapidResult.success || !vapidResult.data) {
        toast.error(vapidResult.error || "Failed to get VAPID key")
        return
      }

      // Subscribe to push notifications
      const subscription = await pushManager.subscribe(vapidResult.data)

      if (!subscription) {
        toast.error("Failed to subscribe to notifications")
        return
      }

      // Send subscription to backend via server action
      const subscribeResult = await subscribeNotificationAction({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(
            String.fromCharCode(
              ...new Uint8Array(subscription.getKey("p256dh")!)
            )
          ),
          auth: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))
          ),
        },
      })

      if (!subscribeResult.success) {
        throw new Error(subscribeResult.error || "Failed to save subscription")
      }

      setIsSubscribed(true)
      toast.success("Notifications enabled successfully!")
    } catch (error) {
      console.error("Error enabling notifications:", error)
      toast.error("Failed to enable notifications")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisableNotifications = async () => {
    setIsLoading(true)

    try {
      const subscription = await pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe on backend via server action
        const result = await unsubscribeNotificationAction(
          subscription.endpoint
        )
        if (!result.success) {
          throw new Error(result.error)
        }

        // Unsubscribe locally
        await pushManager.unsubscribe()
      }

      setIsSubscribed(false)
      toast.success("Notifications disabled")
    } catch (error) {
      console.error("Error disabling notifications:", error)
      toast.error("Failed to disable notifications")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestNotification = async () => {
    try {
      const result = await sendTestNotificationAction()
      if (!result.success) {
        throw new Error(result.error)
      }
      toast.success("Test notification sent!")
    } catch (error) {
      console.error("Error sending test notification:", error)
      toast.error("Failed to send test notification")
    }
  }

  if (!isSupported) {
    return (
      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          Push notifications are not supported in your browser
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-medium">Push Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Get notified about daily words and learning reminders
          </p>
        </div>

        {isSubscribed ? (
          <Bell className="size-5 text-primary" />
        ) : (
          <BellSlash className="size-5 text-muted-foreground" />
        )}
      </div>

      <div className="flex gap-2">
        {!isSubscribed ? (
          <button
            onClick={handleEnableNotifications}
            disabled={isLoading || permission === "denied"}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "Enabling..." : "Enable Notifications"}
          </button>
        ) : (
          <>
            <button
              onClick={handleDisableNotifications}
              disabled={isLoading}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
            >
              {isLoading ? "Disabling..." : "Disable"}
            </button>
            <button
              onClick={handleTestNotification}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Test
            </button>
          </>
        )}
      </div>

      {permission === "denied" && (
        <p className="text-sm text-destructive">
          Notifications are blocked. Please enable them in your browser
          settings.
        </p>
      )}
    </div>
  )
}
