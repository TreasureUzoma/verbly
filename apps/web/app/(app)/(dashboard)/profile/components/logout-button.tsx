"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { SignOutIcon } from "@phosphor-icons/react/dist/ssr"
import { logoutAction } from "../actions"

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleLogout = () => {
    startTransition(async () => {
      const result = await logoutAction()
      if (result.success) {
        toast.success("Logged out successfully")
        router.push("/auth")
      } else {
        toast.error(result.error || "Failed to logout")
      }
    })
  }

  return (
    <Button
      onClick={handleLogout}
      variant="destructive"
      size="sm"
      className="gap-1.5"
      disabled={isPending}
    >
      <SignOutIcon size={16} />
      {isPending ? "Signing out..." : "Sign Out"}
    </Button>
  )
}
