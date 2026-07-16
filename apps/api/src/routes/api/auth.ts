import { Hono } from "hono"
import type { AuthType, AppBindings, ServiceResponse } from "../../types.js"
import type { Context } from "hono"
import { generateTokens, setAuthCookies } from "../../utils/auth-tokens.js"
import { createOauthUser, getGoogleAuthUrl } from "../../services/auth.js"
import { env } from "../../env.js"

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

export default authRoute
