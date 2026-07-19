"use server"

import { api } from "@/lib/api/api"

export async function login() {
  try {
    const response = await api.post<{ url: string }>("/auth/google/url", {})
    return { success: true, url: response.url }
  } catch (error: any) {
    const message = error?.message || "Failed to get login URL"
    return { success: false, error: message }
  }
}
