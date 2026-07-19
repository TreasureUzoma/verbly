import type { Context } from "hono"
import { env } from "../env.js"
import { deleteCookie, setSignedCookie } from "hono/cookie"
import { sign } from "hono/jwt"

export const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60
export const FIFTEEN_MINUTES_SECONDS = 15 * 60

// Helper to determine if we are running on a production URL context
const isProd = (c: Context) => {
  const host = c.req.header("host") || ""
  return host.includes("vercel.app") || host.includes("verbly-api")
}

const setSignedAuthCookie = async (
  c: Context,
  name: string,
  value: string,
  secret: string,
  maxAge: number
) => {
  const productionMode = isProd(c)

  await setSignedCookie(c, name, value, secret, {
    httpOnly: true,
    path: "/",
    sameSite: productionMode ? "None" : "Lax",
    secure: productionMode
      ? true
      : c.req.header("x-forwarded-proto") === "https",
    maxAge,
  })
}

export const generateTokens = async (
  userId: string,
  email: string,
  name: string,
  plan?: string
) => {
  const now = Math.floor(Date.now() / 1000)

  const accessExp = now + FIFTEEN_MINUTES_SECONDS
  const refreshExp = now + SEVEN_DAYS_SECONDS
  const refreshExpDate = new Date(Date.now() + SEVEN_DAYS_SECONDS * 1000)

  const accessToken = await sign(
    { id: userId, email, name, plan, exp: accessExp },
    env.JWT_ACCESS_SECRET
  )

  const refreshToken = await sign(
    { id: userId, exp: refreshExp },
    env.JWT_REFRESH_SECRET
  )

  return { accessToken, refreshToken, refreshExpDate }
}

export const setAuthCookies = async (
  c: Context,
  accessToken: string,
  refreshToken: string
): Promise<void> => {
  await setSignedAuthCookie(
    c,
    "verblyAccessToken",
    accessToken,
    env.JWT_ACCESS_SECRET,
    FIFTEEN_MINUTES_SECONDS
  )

  await setSignedAuthCookie(
    c,
    "verblyRefreshToken",
    refreshToken,
    env.JWT_REFRESH_SECRET,
    SEVEN_DAYS_SECONDS
  )
}

export const clearAuthCookies = async (c: Context): Promise<void> => {
  const productionMode = isProd(c)
  const baseOptions = {
    httpOnly: true,
    path: "/",
    sameSite: productionMode ? ("None" as const) : ("Lax" as const),
  }

  deleteCookie(c, "verblyAccessToken", baseOptions)
  deleteCookie(c, "verblyRefreshToken", baseOptions)
}
