import type { MiddlewareHandler } from "hono"
import { getCookie, setCookie } from "hono/cookie"
import { verify, sign } from "hono/jwt"
import { eq } from "drizzle-orm"
import { db } from "../db/index.js"
import { users } from "../db/schema.js"
import { env } from "../env.js"

const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60
const FIFTEEN_MINUTES_SECONDS = 15 * 60

type AuthEnv = {
  Variables: {
    user: {
      id: string
      email: string
      name?: string | null
    }
  }
}

async function generateTokens(
  userId: string,
  email: string,
  name?: string | null
) {
  const currentTime = Math.floor(Date.now() / 1000)

  const accessToken = await sign(
    {
      id: userId,
      email,
      name,
      exp: currentTime + FIFTEEN_MINUTES_SECONDS,
    },
    env.JWT_ACCESS_SECRET
  )

  const refreshToken = await sign(
    { id: userId, exp: currentTime + SEVEN_DAYS_SECONDS },
    env.JWT_REFRESH_SECRET
  )

  const refreshExpDate = new Date(Date.now() + SEVEN_DAYS_SECONDS * 1000)

  return { accessToken, refreshToken, refreshExpDate }
}

export const withAuth: MiddlewareHandler<AuthEnv> = async (c, next) => {
  try {
    const accessToken = getCookie(c, "letteraAccessToken")

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

    const refreshToken = getCookie(c, "letteraRefreshToken")
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
    } catch {
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

    setCookie(c, "letteraAccessToken", newAccess, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
      maxAge: FIFTEEN_MINUTES_SECONDS,
    })

    setCookie(c, "letteraRefreshToken", newRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
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
