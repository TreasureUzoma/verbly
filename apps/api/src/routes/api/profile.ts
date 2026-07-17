import { Hono } from "hono"
import { StreaksService } from "../../services/streaks.js"
import { WordsService } from "../../services/words.js"
import { UserService } from "../../services/user.js"
import type { AuthType, AppBindings } from "../../types.js"

const profileRoute = new Hono<AppBindings>()

// Get user profile with streak information
profileRoute.get("/", async (c) => {
  try {
    const authUser = c.get("user") as AuthType

    // Get full user profile
    const userProfile = await UserService.getUserProfile(authUser.id)

    if (!userProfile) {
      return c.json(
        {
          success: false,
          message: "User not found",
          data: null,
        },
        404
      )
    }

    // Check and reset streak if needed
    await StreaksService.checkAndResetStreak(authUser.id)

    // Get streak stats
    const streakStats = await StreaksService.getStreakStats(authUser.id)

    // Get learning statistics
    const learningStats = await WordsService.getUserLearningStats(authUser.id)

    return c.json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        user: userProfile,
        streak: {
          currentStreak: streakStats.currentStreak,
          longestStreak: streakStats.longestStreak,
          lastCompletedDate: streakStats.lastCompletedDate,
          completedToday: streakStats.completedToday,
        },
        learning: {
          savedWordsCount: learningStats.savedWordsCount,
          learnedWordsCount: learningStats.learnedWordsCount,
          completedDaysCount: learningStats.completedDaysCount,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return c.json(
      {
        success: false,
        message: "Failed to fetch profile",
        data: null,
      },
      500
    )
  }
})

// Get detailed streak statistics
profileRoute.get("/streak", async (c) => {
  try {
    const authUser = c.get("user") as AuthType

    // Check and reset streak if needed
    await StreaksService.checkAndResetStreak(authUser.id)

    // Get streak stats
    const streakStats = await StreaksService.getStreakStats(authUser.id)

    return c.json({
      success: true,
      message: "Streak statistics fetched successfully",
      data: streakStats,
    })
  } catch (error) {
    console.error("Error fetching streak stats:", error)
    return c.json(
      {
        success: false,
        message: "Failed to fetch streak statistics",
        data: null,
      },
      500
    )
  }
})

export default profileRoute
