"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import {
  completeTodayAction,
  saveWordAction,
  learnWordAction,
} from "../actions"

interface WordActionsProps {
  wordId: number
  isTodayCompleted: boolean
  isTodaySaved: boolean
  isTodayLearned: boolean
}

export function WordActions({
  wordId,
  isTodayCompleted,
  isTodaySaved,
  isTodayLearned,
}: WordActionsProps) {
  const [completeLoading, completeTransition] = useTransition()
  const [saveLoading, saveTransition] = useTransition()
  const [learnLoading, learnTransition] = useTransition()

  const handleComplete = () => {
    completeTransition(async () => {
      const result = await completeTodayAction()
      if (result.success) {
        toast.success("Word marked as completed!")
      } else {
        toast.error(result.error || "Failed to complete word")
      }
    })
  }

  const handleSave = () => {
    saveTransition(async () => {
      const formData = new FormData()
      formData.set("wordId", String(wordId))
      const result = await saveWordAction(formData)
      if (result.success) {
        toast.success("Word saved successfully!")
      } else {
        toast.error(result.error || "Failed to save word")
      }
    })
  }

  const handleLearn = () => {
    learnTransition(async () => {
      const formData = new FormData()
      formData.set("wordId", String(wordId))
      const result = await learnWordAction(formData)
      if (result.success) {
        toast.success("Word marked as learned!")
      } else {
        toast.error(result.error || "Failed to mark as learned")
      }
    })
  }

  return (
    <div className="flex flex-col gap-2 pt-2">
      <Button
        onClick={handleComplete}
        disabled={isTodayCompleted || completeLoading}
        variant={isTodayCompleted ? "outline" : "default"}
        className="w-full"
      >
        {completeLoading
          ? "Loading..."
          : isTodayCompleted
            ? "✓ Completed Today"
            : "Mark as Completed"}
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={handleSave}
          disabled={isTodaySaved || saveLoading}
          variant="outline"
          className="w-full"
        >
          {saveLoading
            ? "Loading..."
            : isTodaySaved
              ? "♥ Saved"
              : "Save for Later"}
        </Button>
        <Button
          onClick={handleLearn}
          disabled={isTodayLearned || learnLoading}
          variant="outline"
          className="w-full"
        >
          {learnLoading
            ? "Loading..."
            : isTodayLearned
              ? "✓ Learned"
              : "Mark as Learned"}
        </Button>
      </div>
    </div>
  )
}
