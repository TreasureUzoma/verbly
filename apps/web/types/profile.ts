export interface ProfileData {
  streak: {
    currentStreak: number
    longestStreak: number
    completedToday: boolean
  }
  learning: {
    completedDaysCount: number
    savedWordsCount: number
    learnedWordsCount: number
  }
}
