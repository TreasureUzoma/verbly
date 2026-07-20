import { api } from "@/lib/api/api"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const data = await api.post("/notifications/test", {})
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to send test notification:", error)
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    )
  }
}
