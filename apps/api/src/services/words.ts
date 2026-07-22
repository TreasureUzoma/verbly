import { eq, and, desc } from "drizzle-orm"
import { db } from "../db/index.js"
import {
  dailyWords,
  savedWords,
  userDailyCompletions,
  learnedWords,
} from "../db/schema.js"
import { generateDailyWord } from "./ai.js"

export class WordsService {
  // Get today's word, generating it automatically if missing
  static async getTodaysWord() {
    const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD format

    const todaysWord = await db
      .select()
      .from(dailyWords)
      .where(eq(dailyWords.date, today))
      .limit(1)

    if (todaysWord.length > 0) {
      return todaysWord[0]
    }

    return await this.createTodaysWord(today)
  }

  static async createTodaysWord(date: string) {
    // Fetch the last 30 days of words to avoid duplicates
    const recentWords = await db
      .select({ word: dailyWords.word })
      .from(dailyWords)
      .orderBy(desc(dailyWords.date))
      .limit(30)

    const previousWords = recentWords.map((w) => w.word)
    const generated = await generateDailyWord(date, previousWords)

    try {
      const [newWord] = await db
        .insert(dailyWords)
        .values({
          word: generated.word,
          definition: generated.definition,
          pronunciation: generated.pronunciation,
          examples: JSON.stringify(generated.examples),
          date,
        })
        .returning()

      return newWord
    } catch (error) {
      // If another request created today's word concurrently, return the existing one.
      const existingWord = await db
        .select()
        .from(dailyWords)
        .where(eq(dailyWords.date, date))
        .limit(1)

      if (existingWord.length > 0) {
        return existingWord[0]
      }

      throw error
    }
  }

  // Get all daily words (admin function)
  static async getAllWords() {
    return await db.select().from(dailyWords).orderBy(dailyWords.date)
  }

  // Add a new daily word (admin function)
  static async addDailyWord(data: {
    word: string
    definition: string
    pronunciation: string
    examples: string[]
    date: string
  }) {
    const [newWord] = await db
      .insert(dailyWords)
      .values({
        word: data.word,
        definition: data.definition,
        pronunciation: data.pronunciation,
        examples: JSON.stringify(data.examples),
        date: data.date,
      })
      .returning()

    return newWord
  }

  // Save a word for a user
  static async saveWord(userId: string, dailyWordId: number) {
    // Check if already saved
    const existingSave = await db
      .select()
      .from(savedWords)
      .where(
        and(
          eq(savedWords.userId, userId),
          eq(savedWords.dailyWordId, dailyWordId)
        )
      )
      .limit(1)

    if (existingSave.length > 0) {
      throw new Error("Word already saved")
    }

    const [savedWord] = await db
      .insert(savedWords)
      .values({
        userId,
        dailyWordId,
      })
      .returning()

    return savedWord
  }

  // Get user's saved words
  static async getUserSavedWords(userId: string) {
    return await db
      .select({
        id: savedWords.id,
        wordId: dailyWords.id,
        word: dailyWords.word,
        definition: dailyWords.definition,
        pronunciation: dailyWords.pronunciation,
        examples: dailyWords.examples,
        savedAt: savedWords.savedAt,
      })
      .from(savedWords)
      .innerJoin(dailyWords, eq(savedWords.dailyWordId, dailyWords.id))
      .where(eq(savedWords.userId, userId))
      .orderBy(savedWords.savedAt)
  }

  // Mark today's word as completed for a user
  static async markTodaysWordCompleted(userId: string, dailyWordId: number) {
    const today = new Date().toISOString().split("T")[0]

    // Check if already completed today
    const existingCompletion = await db
      .select()
      .from(userDailyCompletions)
      .where(
        and(
          eq(userDailyCompletions.userId, userId),
          eq(userDailyCompletions.date, today)
        )
      )
      .limit(1)

    if (existingCompletion.length > 0) {
      throw new Error("Already completed today")
    }

    const [completion] = await db
      .insert(userDailyCompletions)
      .values({
        userId,
        dailyWordId,
        date: today,
      })
      .returning()

    return completion
  }

  // Check if user has completed today's word
  static async hasCompletedToday(userId: string) {
    const today = new Date().toISOString().split("T")[0]

    const completion = await db
      .select()
      .from(userDailyCompletions)
      .where(
        and(
          eq(userDailyCompletions.userId, userId),
          eq(userDailyCompletions.date, today)
        )
      )
      .limit(1)

    return completion.length > 0
  }

  // Mark a word as learned
  static async markWordAsLearned(userId: string, dailyWordId: number) {
    // Check if already marked as learned
    const existingLearned = await db
      .select()
      .from(learnedWords)
      .where(
        and(
          eq(learnedWords.userId, userId),
          eq(learnedWords.dailyWordId, dailyWordId)
        )
      )
      .limit(1)

    if (existingLearned.length > 0) {
      throw new Error("Word already marked as learned")
    }

    const [learnedWord] = await db
      .insert(learnedWords)
      .values({
        userId,
        dailyWordId,
      })
      .returning()

    return learnedWord
  }

  // Get user's learned words
  static async getUserLearnedWords(userId: string) {
    return await db
      .select({
        id: learnedWords.id,
        wordId: dailyWords.id,
        word: dailyWords.word,
        definition: dailyWords.definition,
        pronunciation: dailyWords.pronunciation,
        examples: dailyWords.examples,
        learnedAt: learnedWords.learnedAt,
        originalDate: dailyWords.date,
      })
      .from(learnedWords)
      .innerJoin(dailyWords, eq(learnedWords.dailyWordId, dailyWords.id))
      .where(eq(learnedWords.userId, userId))
      .orderBy(learnedWords.learnedAt)
  }

  // Check if user has learned a specific word
  static async hasLearnedWord(userId: string, dailyWordId: number) {
    const learned = await db
      .select()
      .from(learnedWords)
      .where(
        and(
          eq(learnedWords.userId, userId),
          eq(learnedWords.dailyWordId, dailyWordId)
        )
      )
      .limit(1)

    return learned.length > 0
  }

  // Get learning statistics for a user
  static async getUserLearningStats(userId: string) {
    const savedWords = await this.getUserSavedWords(userId)
    const learnedWords = await this.getUserLearnedWords(userId)

    const completions = await db
      .select()
      .from(userDailyCompletions)
      .where(eq(userDailyCompletions.userId, userId))

    return {
      savedWordsCount: savedWords.length,
      learnedWordsCount: learnedWords.length,
      completedDaysCount: completions.length,
    }
  }
}
