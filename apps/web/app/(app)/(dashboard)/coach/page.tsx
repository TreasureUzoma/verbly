import { CoachPageClient } from "./components/coach-client"
import { api } from "@/lib/api/api"

export default async function CoachPage() {
  const history = await api
    .get<{
      conversations: {
        id: string
        title: string
        updatedAt: string
        messages: { id: number; role: "user" | "assistant"; content: string }[]
      }[]
    }>("/chat/conversations?limit=20")
    .catch(() => ({ conversations: [] }))
  return <CoachPageClient initialThreads={history.conversations} />
}
