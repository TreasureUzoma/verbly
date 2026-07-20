import { api } from "@/lib/api/api"

export async function GET(
  _request: Request,
  context: RouteContext<"/api/chat/conversations/[id]">
) {
  const { id } = await context.params
  return Response.json(await api.get(`/chat/conversations/${id}`))
}
