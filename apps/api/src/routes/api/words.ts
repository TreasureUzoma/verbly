import { Hono } from "hono"
import { WordsService } from "../../services/words.js"
import { StreaksService } from "../../services/streaks.js"
import { UserService } from "../../services/user.js"
import type { AuthType, AppBindings } from "../../types.js"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

const wordsRoute = new Hono<AppBindings>()

// Get today's word
wordsRoute.get("/today", async (c) => {
  try {
    const user = c.get("user") as AuthType
    const todaysWord = await WordsService.getTodaysWord()

    if (!todaysWord) {
      return c.json(
        {
          success: false,
          message: "No word available for today",
          data: null,
        },
        404
      )
    }

    // Check if user has completed today's word
    const hasCompleted = await WordsService.hasCompletedToday(user.id)

    // Check if user has learned today's word
    const hasLearned = await WordsService.hasLearnedWord(user.id, todaysWord.id)

    // Parse examples from JSON string
    const examples = JSON.parse(todaysWord.examples)

    return c.json({
      success: true,
      message: "Today's word fetched successfully",
      data: {
        ...todaysWord,
        examples,
        completed: hasCompleted,
        learned: hasLearned,
      },
    })
  } catch (error) {
    console.error("Error fetching today's word:", error)
    return c.json(
      {
        success: false,
        message: "Failed to fetch today's word",
        data: null,
      },
      500
    )
  }
})

// Mark today's word as completed and update streak
wordsRoute.post("/today/complete", async (c) => {
  try {
    const user = c.get("user") as AuthType
    const todaysWord = await WordsService.getTodaysWord()

    if (!todaysWord) {
      return c.json(
        {
          success: false,
          message: "No word available for today",
          data: null,
        },
        404
      )
    }

    // Mark as completed
    await WordsService.markTodaysWordCompleted(user.id, todaysWord.id)

    // Update streak
    const updatedStreak = await StreaksService.updateStreak(user.id)

    return c.json({
      success: true,
      message: "Word completed successfully",
      data: {
        completed: true,
        streak: {
          currentStreak: updatedStreak.currentStreak,
          longestStreak: updatedStreak.longestStreak,
        },
      },
    })
  } catch (error: any) {
    if (error.message === "Already completed today") {
      return c.json(
        {
          success: false,
          message: "Already completed today's word",
          data: null,
        },
        400
      )
    }

    console.error("Error completing word:", error)
    return c.json(
      {
        success: false,
        message: "Failed to complete word",
        data: null,
      },
      500
    )
  }
})

// Save a word
const saveWordSchema = z.object({
  wordId: z.number(),
})

wordsRoute.post("/save", zValidator("json", saveWordSchema), async (c) => {
  try {
    const user = c.get("user") as AuthType
    const { wordId } = c.req.valid("json")

    const savedWord = await WordsService.saveWord(user.id, wordId)

    return c.json({
      success: true,
      message: "Word saved successfully",
      data: savedWord,
    })
  } catch (error: any) {
    if (error.message === "Word already saved") {
      return c.json(
        {
          success: false,
          message: "Word already saved",
          data: null,
        },
        400
      )
    }

    console.error("Error saving word:", error)
    return c.json(
      {
        success: false,
        message: "Failed to save word",
        data: null,
      },
      500
    )
  }
})

// Get user's saved words
wordsRoute.get("/saved", async (c) => {
  try {
    const user = c.get("user") as AuthType
    const savedWords = await WordsService.getUserSavedWords(user.id)

    // Parse examples for each saved word
    const wordsWithParsedExamples = savedWords.map((word) => ({
      ...word,
      examples: JSON.parse(word.examples),
    }))

    return c.json({
      success: true,
      message: "Saved words fetched successfully",
      data: wordsWithParsedExamples,
    })
  } catch (error) {
    console.error("Error fetching saved words:", error)
    return c.json(
      {
        success: false,
        message: "Failed to fetch saved words",
        data: null,
      },
      500
    )
  }
})

// Admin: Add a new daily word
const addWordSchema = z.object({
  word: z.string().min(1),
  definition: z.string().min(1),
  pronunciation: z.string().min(1),
  examples: z.array(z.string()).min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
})

wordsRoute.post("/admin/add", zValidator("json", addWordSchema), async (c) => {
  try {
    const authUser = c.get("user") as AuthType

    // Get full user data to check role
    const fullUser = await UserService.getFullUserById(authUser.id)

    // Check if user is admin
    if (!fullUser || fullUser.role !== "admin") {
      return c.json(
        {
          success: false,
          message: "Unauthorized: Admin access required",
          data: null,
        },
        403
      )
    }

    const wordData = c.req.valid("json")
    const newWord = await WordsService.addDailyWord(wordData)

    return c.json({
      success: true,
      message: "Daily word added successfully",
      data: newWord,
    })
  } catch (error) {
    console.error("Error adding daily word:", error)
    return c.json(
      {
        success: false,
        message: "Failed to add daily word",
        data: null,
      },
      500
    )
  }
})

// Admin: Get all words
wordsRoute.get("/admin/all", async (c) => {
  try {
    const authUser = c.get("user") as AuthType

    // Get full user data to check role
    const fullUser = await UserService.getFullUserById(authUser.id)

    // Check if user is admin
    if (!fullUser || fullUser.role !== "admin") {
      return c.json(
        {
          success: false,
          message: "Unauthorized: Admin access required",
          data: null,
        },
        403
      )
    }

    const allWords = await WordsService.getAllWords()

    return c.json({
      success: true,
      message: "All words fetched successfully",
      data: allWords,
    })
  } catch (error) {
    console.error("Error fetching all words:", error)
    return c.json(
      {
        success: false,
        message: "Failed to fetch all words",
        data: null,
      },
      500
    )
  }
})

// Mark a word as learned
const learnWordSchema = z.object({
  wordId: z.number(),
})

wordsRoute.post("/learn", zValidator("json", learnWordSchema), async (c) => {
  try {
    const user = c.get("user") as AuthType
    const { wordId } = c.req.valid("json")

    const learnedWord = await WordsService.markWordAsLearned(user.id, wordId)

    return c.json({
      success: true,
      message: "Word marked as learned successfully",
      data: learnedWord,
    })
  } catch (error: any) {
    if (error.message === "Word already marked as learned") {
      return c.json(
        {
          success: false,
          message: "Word already marked as learned",
          data: null,
        },
        400
      )
    }

    console.error("Error marking word as learned:", error)
    return c.json(
      {
        success: false,
        message: "Failed to mark word as learned",
        data: null,
      },
      500
    )
  }
})

// Get user's learned words
wordsRoute.get("/learned", async (c) => {
  try {
    const user = c.get("user") as AuthType
    const learnedWords = await WordsService.getUserLearnedWords(user.id)

    // Parse examples for each learned word
    const wordsWithParsedExamples = learnedWords.map((word) => ({
      ...word,
      examples: JSON.parse(word.examples),
    }))

    return c.json({
      success: true,
      message: "Learned words fetched successfully",
      data: wordsWithParsedExamples,
    })
  } catch (error) {
    console.error("Error fetching learned words:", error)
    return c.json(
      {
        success: false,
        message: "Failed to fetch learned words",
        data: null,
      },
      500
    )
  }
})

// Get user's learning statistics
wordsRoute.get("/stats", async (c) => {
  try {
    const user = c.get("user") as AuthType
    const stats = await WordsService.getUserLearningStats(user.id)

    return c.json({
      success: true,
      message: "Learning statistics fetched successfully",
      data: stats,
    })
  } catch (error) {
    console.error("Error fetching learning stats:", error)
    return c.json(
      {
        success: false,
        message: "Failed to fetch learning statistics",
        data: null,
      },
      500
    )
  }
})

export default wordsRoute
