import { api } from "@/lib/api/api"

export async function POST(request: Request) {
  const response = await api.stream("/chat/stream", {
    body: request.body,
    cache: "no-store",
    duplex: "half",
    headers: {
      "Content-Type": request.headers.get("content-type") || "application/json",
    },
  })

  const headers = new Headers()
  for (const header of [
    "content-type",
    "cache-control",
    "x-vercel-ai-ui-message-stream",
  ]) {
    const value = response.headers.get(header)
    if (value) headers.set(header, value)
  }

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
}
