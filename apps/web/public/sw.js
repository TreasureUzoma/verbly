// Service Worker for Push Notifications

self.addEventListener("install", (event) => {
  console.log("Service Worker installing.")
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating.")
  event.waitUntil(clients.claim())
})

self.addEventListener("push", (event) => {
  console.log("Push notification received:", event)

  if (!event.data) {
    console.log("Push event but no data")
    return
  }

  try {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || "/icon-192.png",
      badge: data.badge || "/badge-72.png",
      data: data.data || {},
      vibrate: [200, 100, 200],
      tag: data.tag || "verbly-notification",
      requireInteraction: false,
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  } catch (error) {
    console.error("Error handling push notification:", error)
  }
})

self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event)

  event.notification.close()

  const urlToOpen = event.notification.data?.url || "/"

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus()
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})
