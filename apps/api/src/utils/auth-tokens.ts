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
  const isProduction = process.env.NODE_ENV === "production"

  setCookie(c, "verblyAccessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax", // "None" required for cross-domain
    path: "/",
    maxAge: FIFTEEN_MINUTES_SECONDS,
    // Remove domain restriction for cross-domain setup
  })

  setCookie(c, "verblyRefreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax", // "None" required for cross-domain
    path: "/",
    maxAge: SEVEN_DAYS_SECONDS,
    // Remove domain restriction for cross-domain setup
  })
}

// Alternative: Return tokens in response for header-based auth
export const getTokenResponse = (accessToken: string, refreshToken: string) => {
  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    expiresIn: FIFTEEN_MINUTES_SECONDS,
  }
}

export const clearAuthCookies = async (c: Context): Promise<void> => {
  const isProduction = process.env.NODE_ENV === "production"

  setCookie(c, "verblyAccessToken", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    path: "/",
    maxAge: 0,
  })

  setCookie(c, "verblyRefreshToken", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    path: "/",
    maxAge: 0,
  })
}
