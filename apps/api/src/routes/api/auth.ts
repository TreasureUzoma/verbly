import { Hono } from "hono"
import type { AuthType, AppBindings, ServiceResponse } from "../../types.js"
import type { Context } from "hono"
import {
  generateTokens,
  setAuthCookies,
  clearAuthCookies,
  FIFTEEN_MINUTES_SECONDS,
} from "../../utils/auth-tokens.js"
import { createOauthUser, getGoogleAuthUrl } from "../../services/auth.js"
import { env } from "../../env.js"
import { verify } from "hono/jwt"
import { getCookie } from "hono/cookie"
import { eq } from "drizzle-orm"
import { db } from "../../db/index.js"
import { users } from "../../db/schema.js"

const authRoute = new Hono<AppBindings>()

const handleAuth = async (
  c: Context<AppBindings>,
  serviceData: ServiceResponse<{
    id: string
    email: string
    name?: string
    subscriptionType?: string | null
  }>
) => {
  if (!serviceData.success || !serviceData.data?.id) {
    return c.json(
      {
        success: false,
        message: serviceData.message || "Authentication failed",
      },
      401
    )
  }

  const { id, email, name } = serviceData.data
  const userAgent = c.req.header("User-Agent") || "unknown"

  const { accessToken, refreshToken, refreshExpDate } = await generateTokens(
    id,
    email,
    name || "-",
    serviceData.data.subscriptionType ?? undefined
  )

  await setAuthCookies(c, accessToken, refreshToken)

  return c.json(
    {
      message: "Authentication successful",
      data: serviceData.data,
      success: true,
    },
    201
  )
}

authRoute.post("/google/url", (c) => {
  return c.json({ url: getGoogleAuthUrl() }, 200)
})

// New endpoint: Get tokens directly for header-based auth
authRoute.post("/google/token", async (c) => {
  const { code } = await c.req.json()

  if (!code) {
    return c.json(
      {
        success: false,
        message: "Missing authorization code",
      },
      400
    )
  }

  const serviceData = await createOauthUser(code)

  if (serviceData.success && serviceData.data?.id) {
    const { id, email, name } = serviceData.data

    const { accessToken, refreshToken } = await generateTokens(
      id,
      email,
      name || "-",
      undefined
    )

    // Set cookies as backup AND return tokens for headers
    await setAuthCookies(c, accessToken, refreshToken)

    return c.json({
      success: true,
      message: "Authentication successful",
      data: {
        user: serviceData.data,
        tokens: {
          accessToken,
          refreshToken,
          tokenType: "Bearer",
          expiresIn: FIFTEEN_MINUTES_SECONDS,
        },
      },
    })
  }

  return c.json(
    {
      success: false,
      message: serviceData.message || "Authentication failed",
    },
    401
  )
})

authRoute.get("/google/callback", async (c) => {
  const code = c.req.query("code")

  if (!code) {
    return c.redirect("/login?error=missing_code", 302)
  }

  const serviceData = await createOauthUser(code)

  if (serviceData.success && serviceData.data?.id) {
    const { id, email, name } = serviceData.data

    const { accessToken, refreshToken } = await generateTokens(
      id,
      email,
      name || "-",
      undefined
    )
    await setAuthCookies(c, accessToken, refreshToken)
    return c.redirect(`${env.WEB_URL}/home`, 302)
  }

  return c.redirect("/login?error=auth_failed", 302)
})

authRoute.post("/logout", async (c) => {
  await clearAuthCookies(c)
  return c.json({
    success: true,
    message: "Logged out successfully",
    data: null,
  })
})

// New endpoint: Refresh access token using refresh token
authRoute.post("/refresh", async (c) => {
  try {
    const body = await c.req.json()
    const refreshToken = body.refreshToken || getCookie(c, "verblyRefreshToken")

    if (!refreshToken) {
      return c.json(
        {
          success: false,
          message: "Refresh token required",
        },
        401
      )
    }

    let decodedRefresh: { id: string }
    try {
      decodedRefresh = (await verify(
        refreshToken,
        env.JWT_REFRESH_SECRET,
        "HS256"
      )) as { id: string }
    } catch (error) {
      return c.json(
        {
          success: false,
          message: "Invalid refresh token",
        },
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
        {
          success: false,
          message: "User not found",
        },
        401
      )
    }

    const { accessToken: newAccess, refreshToken: newRefresh } =
      await generateTokens(user.id, user.email, user.name)

    // Set cookies as backup AND return tokens for headers
    await setAuthCookies(c, newAccess, newRefresh)

    return c.json({
      success: true,
      message: "Tokens refreshed successfully",
      data: {
        tokens: {
          accessToken: newAccess,
          refreshToken: newRefresh,
          tokenType: "Bearer",
          expiresIn: FIFTEEN_MINUTES_SECONDS,
        },
      },
    })
  } catch (error) {
    console.error("Refresh token error:", error)
    return c.json(
      {
        success: false,
        message: "Failed to refresh token",
      },
      500
    )
  }
})

export default authRoute
