import { api } from "@/lib/api/api"
import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    redirect("/login?error=missing_code")
  }

  try {
    await api.post("/auth/google/callback", { code })
    redirect("/home")
  } catch (error) {
    console.error("OAuth exchange failed:", error)
    redirect("/login?error=auth_failed")
  }
}
