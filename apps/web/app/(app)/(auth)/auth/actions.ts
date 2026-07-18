"use server"

import { api } from "@/lib/api/api"

export async function login() {
  const response = await api.post<{ url: string }>("/auth/google/url", {})
  return response.url
}
