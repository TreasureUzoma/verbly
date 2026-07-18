"use server"

import { api } from "@/lib/api/api"
import { redirect } from "next/navigation"

export async function login() {
  const response = await api.post<{ url: string }>("/auth/google/url", {})
  redirect(response.url)
}
