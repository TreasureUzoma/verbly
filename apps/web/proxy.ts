import { cookies } from "next/headers"
import { NextResponse, NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const cookieStore = await cookies()
  const accessToken = cookieStore.get("verblyAccessToken")?.value || ""
  const refreshToken = cookieStore.get("verblyRefreshToken")?.value || ""

  // If missing tokens then redirect to login with "next" param
  if (!accessToken || !refreshToken) {
    const currentPath = pathname + search
    const loginUrl = new URL(`/auth`, request.url)
    loginUrl.searchParams.set("next", currentPath)

    console.log("Redirecting to login:", loginUrl.toString())

    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/home", "/saved", "/coach", "/profile"],
}
