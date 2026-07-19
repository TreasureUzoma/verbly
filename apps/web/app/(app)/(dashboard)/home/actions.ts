"use server"

import { api, invalidate } from "@/lib/api/api"
import { revalidatePath } from "next/cache"

export async function completeTodayAction() {
  try {
    await api.post("/words/today/complete", {})
    invalidate("profile")
    revalidatePath("/home")
    return { success: true }
  } catch (error: unknown) {
    const err = error as { message?: string }
    const message = err?.message || "Failed to complete today's word"
    return { success: false, error: message }
  }
}

export async function saveWordAction(formData: FormData) {
  try {
    const wordId = formData.get("wordId")
    if (!wordId) {
      return { success: false, error: "Word ID is missing" }
    }
    await api.post("/words/save", { wordId: Number(wordId) })
    invalidate("saved-words")
    revalidatePath("/home")
    return { success: true }
  } catch (error: unknown) {
    const err = error as { message?: string }
    const message = err?.message || "Failed to save word"
    return { success: false, error: message }
  }
}

export async function learnWordAction(formData: FormData) {
  try {
    const wordId = formData.get("wordId")
    if (!wordId) {
      return { success: false, error: "Word ID is missing" }
    }
    await api.post("/words/learn", { wordId: Number(wordId) })
    invalidate("learned-words")
    revalidatePath("/home")
    return { success: true }
  } catch (error: unknown) {
    const err = error as { message?: string }
    const message = err?.message || "Failed to mark as learned"
    return { success: false, error: message }
  }
}
