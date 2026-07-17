import type { Context } from "hono"
import { env } from "../env.js"
import { generateSignedCookie } from "hono/cookie"
import { sign } from "hono/jwt"

export const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60
export const FIFTEEN_MINUTES_SECONDS = 15 * 60

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Lax",
  path: "/",
} as const

const setSignedAuthCookie = async (
  c: Context,
  name: string,
  value: string,
  secret: string,
  maxAge: number
) => {
  const cookie = await generateSignedCookie(name, value, secret, {
    ...authCookieOptions,
    maxAge,
  })
  c.header("Set-Cookie", cookie, { append: true })
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
  await setSignedAuthCookie(c, "verblyAccessToken", "", env.JWT_ACCESS_SECRET, 0)
  await setSignedAuthCookie(c, "verblyRefreshToken", "", env.JWT_REFRESH_SECRET, 0)
}
