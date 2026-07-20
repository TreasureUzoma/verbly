import { api } from "@/lib/api/api"

export async function GET() {
  return Response.json(await api.get("/chat/conversations"))
}

export async function POST(request: Request) {
  return Response.json(
    await api.post(
      "/chat/conversations",
      await request.json().catch(() => ({}))
    )
  )
}
