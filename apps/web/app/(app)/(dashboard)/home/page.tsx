"use client"

import { useGetSession } from "@/hooks/use-session"
import { Button } from "@workspace/ui/components/button"
import {
  useGetTodaysWord,
  useCompleteTodaysWord,
  useSaveWord,
  useGetSavedWords,
  useGetLearnedWords,
  useGetProfile,
  useLearnWord
} from "@/hooks/use-words"
import {
  FlameIcon,
  HeartIcon,
  CheckCircleIcon
} from "@phosphor-icons/react"
import { useState } from "react"

export default function HomePage() {
  const { data: user, isLoading: isUserLoading } = useGetSession()
  const { data: todayWord, isLoading: isWordLoading } = useGetTodaysWord()
  const { data: savedWords = [], isLoading: isSavedLoading } = useGetSavedWords()
  const { data: learnedWords = [], isLoading: isLearnedLoading } = useGetLearnedWords()
  const { data: profile } = useGetProfile()

  const completeMutation = useCompleteTodaysWord()
  const saveMutation = useSaveWord()
  const learnMutation = useLearnWord()

  const [message, setMessage] = useState<string | null>(null)

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync()
      setMessage("Daily word marked as completed! Streak updated.")
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Failed to complete daily word.")
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleSave = async (wordId: number) => {
    try {
      await saveMutation.mutateAsync(wordId)
      setMessage("Word saved to your library.")
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Failed to save word.")
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleLearn = async (wordId: number) => {
    try {
      await learnMutation.mutateAsync(wordId)
      setMessage("Word marked as learned!")
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Failed to mark word as learned.")
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const isLoading = isUserLoading || isWordLoading || isSavedLoading || isLearnedLoading

  if (isLoading) {
    return (
      <div className="pb-24 p-4 space-y-6">
        <div className="h-8 w-40 bg-foreground/10 animate-pulse rounded" />
        <div className="h-20 w-full bg-foreground/10 animate-pulse rounded" />
        <div className="h-60 w-full bg-foreground/10 animate-pulse rounded" />
      </div>
    )
  }

  const isTodayCompleted = todayWord?.completed || profile?.streak?.completedToday
  const isTodaySaved = todayWord ? savedWords.some((sw) => sw.word.toLowerCase() === todayWord.word.toLowerCase()) : false
  const isTodayLearned = todayWord?.learned || (todayWord ? learnedWords.some((lw) => lw.word.toLowerCase() === todayWord.word.toLowerCase()) : false)

  return (
    <div className="pb-24">
      <div className="p-4 space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hi {user?.name}!
          </h1>
          <p className="text-sm opacity-70">Ready to learn your word for today?</p>
        </div>

        {/* Stats Section */}
        <div className="border rounded-md divide-y divide-border">
          <div className="grid grid-cols-3 divide-x divide-border">
            <div className="p-3 text-center">
              <span className="block text-[10px] uppercase font-bold tracking-wider opacity-60">Streak</span>
              <div className="mt-1 flex items-center justify-center gap-1">
                <FlameIcon size={16} weight="fill" className="text-foreground" />
                <span className="text-lg font-bold">{profile?.streak?.currentStreak ?? 0}</span>
              </div>
            </div>
            <div className="p-3 text-center">
              <span className="block text-[10px] uppercase font-bold tracking-wider opacity-60">Saved</span>
              <div className="mt-1 flex items-center justify-center gap-1">
                <HeartIcon size={16} weight="fill" className="text-foreground" />
                <span className="text-lg font-bold">{savedWords.length}</span>
              </div>
            </div>
            <div className="p-3 text-center">
              <span className="block text-[10px] uppercase font-bold tracking-wider opacity-60">Learned</span>
              <div className="mt-1 flex items-center justify-center gap-1">
                <CheckCircleIcon size={16} weight="fill" className="text-foreground" />
                <span className="text-lg font-bold">{learnedWords.length}</span>
              </div>
            </div>
          </div>
          {profile?.streak?.longestStreak ? (
            <div className="px-4 py-2 text-center text-xs opacity-70">
              Longest streak: {profile.streak.longestStreak} days
            </div>
          ) : null}
        </div>

        {/* Word of the Day Section */}
        <div className="border rounded-md p-4 space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Word of the Day</span>
            {todayWord ? (
              <>
                <h2 className="text-3xl font-black mt-1 tracking-tight">{todayWord.word}</h2>
                <p className="text-sm italic opacity-70 font-mono mt-0.5">{todayWord.pronunciation}</p>
                <div className="border-t my-3" />
                <p className="text-base">{todayWord.definition}</p>
                
                {todayWord.examples && todayWord.examples.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 block">Example Sentences</span>
                    <ul className="list-disc pl-4 space-y-1 text-sm">
                      {todayWord.examples.map((example, idx) => (
                        <li key={idx} className="opacity-90">{example}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm py-4">No word featured for today. Come back tomorrow!</p>
            )}
          </div>

          {todayWord && (
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant={isTodayCompleted ? "outline" : "default"}
                onClick={handleComplete}
                disabled={isTodayCompleted || completeMutation.isPending}
                className="w-full"
              >
                {isTodayCompleted ? "✓ Completed Today" : "Mark as Completed"}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSave(todayWord.id)}
                  disabled={isTodaySaved || saveMutation.isPending}
                  className="w-full"
                >
                  {isTodaySaved ? "♥ Saved" : "Save for Later"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleLearn(todayWord.id)}
                  disabled={isTodayLearned || learnMutation.isPending}
                  className="w-full"
                >
                  {isTodayLearned ? "✓ Learned" : "Mark as Learned"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Toast / Status Message */}
        {message && (
          <div className="border p-3 text-center text-xs font-bold rounded-md">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
