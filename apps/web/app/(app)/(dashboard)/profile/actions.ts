"use server"

import { api } from "@/lib/api/api"
import { redirect } from "next/navigation"

export async function logoutAction() {
  await api.post("/auth/logout", {})
  redirect("/auth")
}
