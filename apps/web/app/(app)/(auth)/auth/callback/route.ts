import { api } from "@/lib/api/api"
import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    return redirect("/login?error=missing_code")
  }

  try {
    await api.post("/auth/google/callback", { code })
  } catch (error) {
    console.error("OAuth exchange failed:", error)
    const message = error instanceof Error ? error.message : String(error)
    console.error("OAuth exchange error details:", message)
    return redirect(
      `/auth?error=auth_failed&reason=${encodeURIComponent(message)}`
    )
  }

  redirect("/home")
}
