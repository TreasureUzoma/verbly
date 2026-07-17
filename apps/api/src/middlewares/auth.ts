import type { MiddlewareHandler } from "hono"
import { getSignedCookie } from "hono/cookie"
import { verify } from "hono/jwt"
import { eq } from "drizzle-orm"
import { db } from "../db/index.js"
import { users } from "../db/schema.js"
import { env } from "../env.js"
import {
  FIFTEEN_MINUTES_SECONDS,
  generateTokens,
  setAuthCookies,
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
    const accessToken = await getSignedCookie(
      c,
      env.JWT_ACCESS_SECRET,
      "verblyAccessToken"
    )

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

    const refreshToken = await getSignedCookie(
      c,
      env.JWT_REFRESH_SECRET,
      "verblyRefreshToken"
    )
    if (!refreshToken) {
      return c.json({ message: "Unauthorized", success: false }, 401)
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
      return c.json({ message: "Unauthorized", success: false }, 401)
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decodedRefresh.id))
      .limit(1)

    if (!user) {
      return c.json({ message: "Unauthorized", success: false }, 401)
    }

    const { accessToken: newAccess, refreshToken: newRefresh } =
      await generateTokens(user.id, user.email, user.name)
    await setAuthCookies(c, newAccess, newRefresh)

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
