export interface Word {
  id: number
  word: string
  definition: string
  pronunciation: string
  examples: string[]
  completed: boolean
  learned: boolean
}

export interface SavedWord {
  id: number
  wordId: number
  word: string
}

export interface LearnedWord {
  id: number
  wordId: number
  word: string
  pronunciation: string
  definition: string
  learnedAt: string
}
