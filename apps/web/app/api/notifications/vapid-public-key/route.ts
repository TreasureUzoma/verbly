import { api } from "@/lib/api/api"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await api.get<{ publicKey: string }>(
      "/notifications/vapid-public-key"
    )
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to get VAPID public key:", error)
    return NextResponse.json(
      { error: "Failed to get VAPID public key" },
      { status: 500 }
    )
  }
}
