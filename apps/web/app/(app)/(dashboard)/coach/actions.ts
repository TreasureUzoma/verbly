"use server"

import { api } from "@/lib/api/api"

export async function createCoachConversation() {
  return api.post("/chat/conversations", {})
}
