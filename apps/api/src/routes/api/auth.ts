import { Hono } from "hono"
import type { AuthType, AppBindings, ServiceResponse } from "../../types.js"
import type { Context } from "hono"
import { generateTokens } from "../../utils/auth-tokens.js"
import { createOauthUser, getGoogleAuthUrl } from "../../services/auth.js"
import { env } from "../../env.js"

const authRoute = new Hono<AppBindings>()

authRoute.post("/google/url", (c) => {
  return c.json({ url: getGoogleAuthUrl() }, 200)
})

authRoute.post("/google/callback", async (c) => {
  const body = await c.req.json()
  const code = body.code

  if (!code) {
    return c.json({ success: false, error: "missing_code" }, 400)
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
    c.header("x-access-token", accessToken)
    c.header("x-refresh-token", refreshToken)
    return c.json({ success: true })
  }

  return c.json({ success: false, error: "auth_failed" }, 400)
})

authRoute.post("/logout", async (c) => {
  c.header("x-access-token", "")
  c.header("x-refresh-token", "")
  return c.json({
    success: true,
    message: "Logged out successfully",
    data: null,
  })
})

export default authRoute
