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
