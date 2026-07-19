import { fetcher } from "@/lib/api/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export interface Word {
  id: number
  word: string
  definition: string
  pronunciation: string
  examples: string[]
  date: string
  completed: boolean
  learned: boolean
}

export interface SavedWord {
  id: number
  wordId: number
  word: string
  definition: string
  pronunciation: string
  examples: string[]
  savedAt: string
}

export interface LearnedWord {
  id: number
  wordId: number
  word: string
  definition: string
  pronunciation: string
  examples: string[]
  learnedAt: string
  originalDate: string
}

export interface ProfileData {
  user: {
    id: string
    name: string
    username: string
    email: string
    avatarUrl: string | null
    subscriptionType: "free" | "pro"
    role: "user" | "admin"
    createdAt: string
  }
  streak: {
    currentStreak: number
    longestStreak: number
    lastCompletedDate: string | null
    completedToday: boolean
  }
  learning: {
    savedWordsCount: number
    learnedWordsCount: number
    completedDaysCount: number
  }
}

// 1. Get today's featured word
export const useGetTodaysWord = () => {
  return useQuery<Word | null>({
    queryKey: ["today-word"],
    queryFn: async () => {
      try {
        const response = await fetcher.get<Word>("/words/today")
        return response.data
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null
        }
        throw error
      }
    },
  })
}

// 2. Mark today's word as completed
export const useCompleteTodaysWord = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await fetcher.post<{
        completed: boolean
        streak: { currentStreak: number; longestStreak: number }
      }>("/words/today/complete")
      return response.data
    },
    onSuccess: () => {
      toast.success("Word marked as completed!")
      queryClient.invalidateQueries({ queryKey: ["today-word"] })
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to complete word"
      toast.error(message)
    },
  })
}

// 3. Save a word
export const useSaveWord = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (wordId: number) => {
      const response = await fetcher.post("/words/save", { wordId })
      return response.data
    },
    onSuccess: () => {
      toast.success("Word saved successfully!")
      queryClient.invalidateQueries({ queryKey: ["saved-words"] })
      queryClient.invalidateQueries({ queryKey: ["today-word"] })
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to save word"
      toast.error(message)
    },
  })
}

// 4. Get saved words
export const useGetSavedWords = () => {
  return useQuery<SavedWord[]>({
    queryKey: ["saved-words"],
    queryFn: async () => {
      const response = await fetcher.get<SavedWord[]>("/words/saved")
      return response.data || []
    },
  })
}

// 5. Mark a word as learned
export const useLearnWord = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (wordId: number) => {
      const response = await fetcher.post("/words/learn", { wordId })
      return response.data
    },
    onSuccess: () => {
      toast.success("Word marked as learned!")
      queryClient.invalidateQueries({ queryKey: ["learned-words"] })
      queryClient.invalidateQueries({ queryKey: ["saved-words"] })
      queryClient.invalidateQueries({ queryKey: ["today-word"] })
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to mark word as learned"
      toast.error(message)
    },
  })
}

// 6. Get learned words
export const useGetLearnedWords = () => {
  return useQuery<LearnedWord[]>({
    queryKey: ["learned-words"],
    queryFn: async () => {
      const response = await fetcher.get<LearnedWord[]>("/words/learned")
      return response.data || []
    },
  })
}

// 7. Get user profile
export const useGetProfile = () => {
  return useQuery<ProfileData>({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await fetcher.get<ProfileData>("/profile")
      return response.data
    },
  })
}

// 8. Logout hook
export const useLogout = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await fetcher.post("/auth/logout")
    },
    onSuccess: () => {
      toast.success("Logged out successfully")
      queryClient.clear()
      router.push("/auth")
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to logout"
      toast.error(message)
    },
  })
}
