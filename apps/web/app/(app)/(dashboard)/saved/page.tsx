"use client"

import { useGetSavedWords, useLearnWord, useGetLearnedWords } from "@/hooks/use-words"
import { Button } from "@workspace/ui/components/button"
import { CheckCircleIcon, HeartIcon } from "@phosphor-icons/react"
import { useState } from "react"

export default function SavedPage() {
  const { data: savedWords = [], isLoading: isSavedLoading } = useGetSavedWords()
  const { data: learnedWords = [] } = useGetLearnedWords()
  const learnMutation = useLearnWord()
  const [message, setMessage] = useState<string | null>(null)

  const handleLearn = async (wordId: number) => {
    try {
      await learnMutation.mutateAsync(wordId)
      setMessage("Word successfully marked as learned!")
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Failed to mark word as learned.")
      setTimeout(() => setMessage(null), 3000)
    }
  }

  if (isSavedLoading) {
    return (
      <div className="pb-24 p-4 space-y-4">
        <div className="h-8 w-48 bg-foreground/10 animate-pulse rounded" />
        <div className="h-32 w-full bg-foreground/10 animate-pulse rounded" />
        <div className="h-32 w-full bg-foreground/10 animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="pb-24">
      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved Words</h1>
          <p className="text-sm opacity-70">
            {savedWords.length === 1 ? "1 saved word" : `${savedWords.length} saved words`} to review
          </p>
        </div>

        {message && (
          <div className="border p-3 text-center text-xs font-bold rounded-md">
            {message}
          </div>
        )}

        {savedWords.length === 0 ? (
          <div className="border border-dashed rounded-md p-8 text-center space-y-3">
            <HeartIcon size={32} weight="regular" className="mx-auto opacity-50" />
            <p className="text-sm font-medium">Your saved library is empty</p>
            <p className="text-xs opacity-60 max-w-xs mx-auto">
              Save new words from the Home page as you encounter them to review them later here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedWords.map((word) => {
              const isAlreadyLearned = learnedWords.some((lw) => lw.word.toLowerCase() === word.word.toLowerCase())
              return (
                <div key={word.id} className="border rounded-md p-4 space-y-3">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">{word.word}</h2>
                    <p className="text-xs italic opacity-70 font-mono">{word.pronunciation}</p>
                  </div>
                  
                  <p className="text-sm">{word.definition}</p>

                  {word.examples && word.examples.length > 0 && (
                    <div className="text-xs opacity-85 space-y-1">
                      <span className="font-semibold opacity-60 uppercase tracking-wider block text-[9px]">Examples</span>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {word.examples.map((ex, idx) => (
                          <li key={idx}>"{ex}"</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2 border-t flex justify-end">
                    <Button
                      variant={isAlreadyLearned ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleLearn(word.wordId)}
                      disabled={isAlreadyLearned || learnMutation.isPending}
                      className="gap-1.5"
                    >
                      <CheckCircleIcon size={16} weight={isAlreadyLearned ? "fill" : "regular"} />
                      {isAlreadyLearned ? "Learned" : "Mark as Learned"}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
