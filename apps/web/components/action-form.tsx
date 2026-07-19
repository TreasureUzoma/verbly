"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"

interface ActionFormProps {
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>
  children?: React.ReactNode
  onSuccess?: () => void
  successMessage?: string
}

export function ActionForm({
  action,
  children,
  onSuccess,
  successMessage = "Action completed successfully",
}: ActionFormProps) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await action(formData)
      if (result.success) {
        toast.success(successMessage)
        onSuccess?.()
      } else {
        toast.error(result.error || "Something went wrong")
      }
    })
  }

  return (
    <form action={handleSubmit} className="w-full">
      {children}
      {/* Children should contain the submit button and any hidden inputs */}
    </form>
  )
}

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>
  successMessage?: string
  onSuccess?: () => void
}

export function ActionButton({
  action,
  successMessage = "Action completed successfully",
  onSuccess,
  children,
  ...props
}: ActionButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      const formData = new FormData()
      const result = await action(formData)
      if (result.success) {
        toast.success(successMessage)
        onSuccess?.()
      } else {
        toast.error(result.error || "Something went wrong")
      }
    })
  }

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={isPending || props.disabled}
    >
      {isPending ? "Loading..." : children}
    </Button>
  )
}
