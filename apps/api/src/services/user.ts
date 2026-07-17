import { eq } from "drizzle-orm"
import { db } from "../db/index.js"
import { users } from "../db/schema.js"

export class UserService {
  // Get full user data by ID
  static async getFullUserById(userId: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    return user || null
  }

  // Get user profile data (safe to return to client)
  static async getUserProfile(userId: string) {
    const user = await this.getFullUserById(userId)

    if (!user) {
      return null
    }

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      subscriptionType: user.subscriptionType,
      role: user.role,
      createdAt: user.createdAt,
    }
  }
}
