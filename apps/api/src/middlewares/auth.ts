import type { MiddlewareHandler } from "hono"
import { getCookie, setCookie } from "hono/cookie"
import { verify } from "hono/jwt"
import { eq } from "drizzle-orm"
import { db } from "../db/index.js"
import { users } from "../db/schema.js"
import { env } from "../env.js"
import {
  FIFTEEN_MINUTES_SECONDS,
  generateTokens,
  SEVEN_DAYS_SECONDS,
} from "../utils/auth-tokens.js"

type AuthEnv = {
  Variables: {
    user: {
      id: string
      email: string
      name?: string | null
    }
  }
}

export const withAuth: MiddlewareHandler<AuthEnv> = async (c, next) => {
  try {
    // First try Authorization header (for cross-domain)
    const authHeader = c.req.header("Authorization")
    if (authHeader?.startsWith("Bearer ")) {
      const accessToken = authHeader.slice(7) // Remove "Bearer " prefix
      try {
        const decoded = (await verify(
          accessToken,
          env.JWT_ACCESS_SECRET,
          "HS256"
        )) as {
          id: string
          email: string
          name?: string | null
        }

        c.set("user", decoded)
        return await next()
      } catch (error) {
        console.log("Invalid bearer token:", error)
        // Continue to cookie check if bearer token is invalid
      }
    }

    // Fallback to cookie-based auth (for same-domain)
    const accessToken = getCookie(c, "verblyAccessToken")

    if (accessToken) {
      try {
        const decoded = (await verify(
          accessToken,
          env.JWT_ACCESS_SECRET,
          "HS256"
        )) as {
          id: string
          email: string
          name?: string | null
        }

        c.set("user", decoded)
        return await next()
      } catch {}
    }

    const refreshToken = getCookie(c, "verblyRefreshToken")
    if (!refreshToken) {
      return c.json(
        { message: "Unauthorized: No valid token found", success: false },
        401
      )
    }

    let decodedRefresh: { id: string }
    try {
      decodedRefresh = (await verify(
        refreshToken,
        env.JWT_REFRESH_SECRET,
        "HS256"
      )) as {
        id: string
      }
    } catch (error) {
      console.log(error)
      return c.json(
        { message: "Unauthorized: Invalid refresh token", success: false },
        401
      )
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decodedRefresh.id))
      .limit(1)

    if (!user) {
      return c.json(
        { message: "Unauthorized: User not found", success: false },
        401
      )
    }

    const { accessToken: newAccess, refreshToken: newRefresh } =
      await generateTokens(user.id, user.email, user.name)

    setCookie(c, "verblyAccessToken", newAccess, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: FIFTEEN_MINUTES_SECONDS,
    })

    setCookie(c, "verblyRefreshToken", newRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: SEVEN_DAYS_SECONDS,
    })

    c.set("user", {
      id: user.id,
      email: user.email,
      name: user.name,
    })

    return await next()
  } catch (err) {
    console.error("Auth middleware error:", err)
    return c.json({ message: "Unauthorized (middleware)", success: false }, 401)
  }
}
