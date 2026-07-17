import { sign } from "hono/jwt"
import { setCookie } from "hono/cookie"
import type { Context } from "hono"
import { env } from "../env.js"

export const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60
export const FIFTEEN_MINUTES_SECONDS = 15 * 60

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
  // In development with proxy, don't set domain so cookies work on localhost
  // In production, domain will be set automatically by the browser
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax" as const,
    path: "/",
  }

  setCookie(c, "verblyAccessToken", accessToken, {
    ...cookieOptions,
    maxAge: FIFTEEN_MINUTES_SECONDS,
  })

  setCookie(c, "verblyRefreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: SEVEN_DAYS_SECONDS,
  })
}

export const clearAuthCookies = async (c: Context): Promise<void> => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax" as const,
    path: "/",
    maxAge: 0,
  }

  setCookie(c, "verblyAccessToken", "", cookieOptions)
  setCookie(c, "verblyRefreshToken", "", cookieOptions)
}
