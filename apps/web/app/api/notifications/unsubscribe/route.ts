import { api } from "@/lib/api/api"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await api.post("/notifications/unsubscribe", body)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to unsubscribe from notifications:", error)
    return NextResponse.json(
      { error: "Failed to unsubscribe from notifications" },
      { status: 500 }
    )
  }
}
