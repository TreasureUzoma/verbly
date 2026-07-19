"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr"
import { learnWordAction } from "../actions"

interface SavedWordItemProps {
  word: {
    id: number
    wordId: number
    word: string
    pronunciation: string
    definition: string
    examples: string[]
  }
  isAlreadyLearned: boolean
}

export function SavedWordItem({ word, isAlreadyLearned }: SavedWordItemProps) {
  const [isPending, startTransition] = useTransition()

  const handleLearn = () => {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("wordId", String(word.wordId))
      const result = await learnWordAction(formData)
      if (result.success) {
        toast.success("Word marked as learned!")
      } else {
        toast.error(result.error || "Failed to mark as learned")
      }
    })
  }

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight">{word.word}</h2>
        <p className="font-mono text-xs italic opacity-70">
          {word.pronunciation}
        </p>
      </div>

      <p className="text-sm">{word.definition}</p>

      {word.examples.length > 0 && (
        <div className="space-y-1 text-xs opacity-85">
          <span className="block text-[9px] uppercase opacity-60">
            Examples
          </span>
          <ul className="list-disc space-y-0.5 pl-4">
            {word.examples.map((ex, idx) => (
              <li key={idx}>
                <q>{ex}</q>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end border-t pt-2">
        <Button
          onClick={handleLearn}
          variant={isAlreadyLearned ? "outline" : "default"}
          size="sm"
          className="gap-1.5"
          disabled={isAlreadyLearned || isPending}
        >
          <CheckCircleIcon
            size={16}
            weight={isAlreadyLearned ? "fill" : "regular"}
          />
          {isPending
            ? "Loading..."
            : isAlreadyLearned
              ? "Learned"
              : "Mark as Learned"}
        </Button>
      </div>
    </div>
  )
}
