import { eq, and } from "drizzle-orm"
import { db } from "../db/index.js"
import { userStreaks, userDailyCompletions } from "../db/schema.js"

export class StreaksService {
  // Initialize streak for a new user
  static async initializeUserStreak(userId: string) {
    const [streak] = await db
      .insert(userStreaks)
      .values({
        userId,
        currentStreak: 0,
        longestStreak: 0,
      })
      .returning()

    return streak
  }

  // Get user's streak information
  static async getUserStreak(userId: string) {
    const streak = await db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId))
      .limit(1)

    if (streak.length === 0) {
      // Initialize streak if doesn't exist
      return await this.initializeUserStreak(userId)
    }

    return streak[0]
  }

  // Update streak when user completes today's word
  static async updateStreak(userId: string) {
    const userStreak = await this.getUserStreak(userId)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const todayStr = today.toISOString().split("T")[0]
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    let newCurrentStreak = 1 // At least 1 since they completed today

    // If they completed yesterday, increment streak
    if (userStreak.lastCompletedDate === yesterdayStr) {
      newCurrentStreak = userStreak.currentStreak + 1
    }

    // Update longest streak if current is greater
    const newLongestStreak = Math.max(
      userStreak.longestStreak,
      newCurrentStreak
    )

    const [updatedStreak] = await db
      .update(userStreaks)
      .set({
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastCompletedDate: todayStr,
        updatedAt: new Date(),
      })
      .where(eq(userStreaks.userId, userId))
      .returning()

    return updatedStreak
  }

  // Check if user needs streak reset (didn't complete yesterday)
  static async checkAndResetStreak(userId: string) {
    const userStreak = await this.getUserStreak(userId)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const yesterdayStr = yesterday.toISOString().split("T")[0]

    // If last completed date is not yesterday and not today, reset streak
    if (
      userStreak.lastCompletedDate &&
      userStreak.lastCompletedDate !== yesterdayStr &&
      userStreak.lastCompletedDate !== today.toISOString().split("T")[0]
    ) {
      const [resetStreak] = await db
        .update(userStreaks)
        .set({
          currentStreak: 0,
          updatedAt: new Date(),
        })
        .where(eq(userStreaks.userId, userId))
        .returning()

      return resetStreak
    }

    return userStreak
  }

  // Get streak statistics
  static async getStreakStats(userId: string) {
    const streak = await this.getUserStreak(userId)
    const today = new Date().toISOString().split("T")[0]

    // Check if completed today
    const completedToday = await db
      .select()
      .from(userDailyCompletions)
      .where(
        and(
          eq(userDailyCompletions.userId, userId),
          eq(userDailyCompletions.date, today)
        )
      )
      .limit(1)

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastCompletedDate: streak.lastCompletedDate,
      completedToday: completedToday.length > 0,
    }
  }
}
