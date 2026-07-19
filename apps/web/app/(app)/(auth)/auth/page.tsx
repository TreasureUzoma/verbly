"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { login } from "./actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    try {
      const result = await login()
      if (result.success && result.url) {
        router.push(result.url)
      } else {
        toast.error(result.error || "Failed to sign in")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome to Verbly</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Sign in to start your vocabulary journey.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            size="lg"
            type="submit"
            onClick={() => handleGoogleAuth()}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Signing in..." : "Sign in with Google"}
            {!isLoading && (
              <Image
                src="/assets/logos/google-g.png"
                alt="Google Logo"
                width={16}
                height={16}
                className="ml-2"
              />
            )}
          </Button>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          Don&apos;t have an account yet? No problem! We&apos;ll create one for
          you during sign-in.
        </p>
      </div>
    </div>
  )
}
