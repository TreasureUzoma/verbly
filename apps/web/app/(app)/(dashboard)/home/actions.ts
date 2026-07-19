"use server"

import { api } from "@/lib/api/api"

export async function completeTodayAction() {
  try {
    await api.post("/words/today/complete", {})
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
    return { success: true }
  } catch (error: unknown) {
    const err = error as { message?: string }
    const message = err?.message || "Failed to mark as learned"
    return { success: false, error: message }
  }
}
