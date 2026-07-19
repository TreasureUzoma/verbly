"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import {
  completeTodayAction,
  saveWordAction,
  learnWordAction,
} from "../actions"
import {
  CheckCircleIcon,
  CheckIcon,
  CircleWavyCheckIcon,
  HeartIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react"

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
        {completeLoading ? (
          <>
            <SpinnerGapIcon className="size-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : isTodayCompleted ? (
          <>
            <CircleWavyCheckIcon
              className="size-4 text-green-500"
              weight="fill"
            />
            <span>Completed Today</span>
          </>
        ) : (
          <>
            <CheckIcon className="size-4" />
            <span>Mark as Completed</span>
          </>
        )}
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={handleSave}
          disabled={isTodaySaved || saveLoading}
          variant="outline"
          className="w-full"
        >
          {saveLoading ? (
            <>
              <SpinnerGapIcon className="size-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : isTodaySaved ? (
            <>
              <HeartIcon className="size-4 text-blue-500" weight="fill" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <HeartIcon className="size-4" />
              <span>Save for Later</span>
            </>
          )}
        </Button>
        <Button
          onClick={handleLearn}
          disabled={isTodayLearned || learnLoading}
          variant="outline"
          className="w-full"
        >
          {learnLoading ? (
            <>
              <SpinnerGapIcon className="size-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : isTodayLearned ? (
            <>
              <CheckCircleIcon
                className="size-4 text-green-500"
                weight="fill"
              />
              <span>Learned</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="size-4" />
              <span>Mark as Learned</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
