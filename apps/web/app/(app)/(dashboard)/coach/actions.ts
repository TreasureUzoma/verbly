"use server"

import { api, invalidate } from "@/lib/api/api"
import { revalidatePath } from "next/cache"

export async function createCoachConversation() {
  const conversation = await api.post("/chat/conversations", {})
  revalidatePath("/coach")
  invalidate("coach-conversations")
  return conversation
}

export async function updateConversationTitle(id: string, title: string) {
  const conversation = await api.patch(`/chat/conversations/${id}`, { title })
  revalidatePath("/coach")
  invalidate("coach-conversations")
  return conversation
}

export async function deleteConversation(id: string) {
  const conversation = await api.delete(`/chat/conversations/${id}`)
  revalidatePath("/coach")
  invalidate("coach-conversations")
  return conversation
}
