import { eq } from "drizzle-orm"
import { db } from "../db/index.js"
import { users } from "../db/schema.js"
import { env } from "../env.js"
import { google } from "googleapis"

const GOOGLE_REDIRECT_URI = `${env.WEB_URL}/auth/callback`

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
)

export const getGoogleAuthUrl = () => {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ]

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes.join(" "),
  })
}

export const createOauthUser = async (code?: string) => {
  if (!code) {
    return {
      message: "Missing google authorization code",
      data: null,
      success: false,
    }
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client })
    const { data: userInfo } = await oauth2.userinfo.get()

    if (!userInfo.email || !userInfo.id) {
      return {
        message: "Invalid Google user data",
        data: null,
        success: false,
      }
    }

    return await upsertUser({
      providerId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name || "Unknown",
      authMethod: "google",
      avatarUrl: userInfo.picture || null,
    })
  } catch (error) {
    console.error("Google token exchange failed:", error)
    return {
      message: "Google authentication failed",
      data: null,
      success: false,
    }
  }
}

const upsertUser = async (user: {
  providerId: string
  email: string
  name: string
  avatarUrl: string | null
  authMethod: "google"
}) => {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, user.email))
    .limit(1)

  let currentUserId: string

  if (existing.length === 0) {
    const [newUser] = await db
      .insert(users)
      .values({
        providerId: user.providerId,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        authMethod: user.authMethod,
        emailVerifiedAt: new Date(),
      })
      .returning({ id: users.id })

    currentUserId = newUser!.id
  } else {
    currentUserId = existing[0]!.id
  }

  return {
    message: "OAuth user created or fetched successfully",
    data: { id: currentUserId, email: user.email, name: user.name },
    success: true,
  }
}
