"use server"

import { api } from "@/lib/api/api"
import { redirect } from "next/navigation"

export async function completeTodayAction() {
  await api.post("/words/today/complete", {})
  redirect("/home")
}

export async function saveWordAction(formData: FormData) {
  const wordId = formData.get("wordId")
  if (!wordId) {
    redirect("/home")
  }
  await api.post("/words/save", { wordId: Number(wordId) })
  redirect("/home")
}

export async function learnWordAction(formData: FormData) {
  const wordId = formData.get("wordId")
  if (!wordId) {
    redirect("/home")
  }
  await api.post("/words/learn", { wordId: Number(wordId) })
  redirect("/home")
}
