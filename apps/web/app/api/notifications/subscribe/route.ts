import { api } from "@/lib/api/api"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await api.post("/notifications/subscribe", body)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to subscribe to notifications:", error)
    return NextResponse.json(
      { error: "Failed to subscribe to notifications" },
      { status: 500 }
    )
  }
}
