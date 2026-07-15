"use client"

import { Button } from "@workspace/ui/components/button"
import { useCallback } from "react"
import { useAuthLogin } from "../hooks/use-auth-login"
import Image from "next/image"
import { SpinnerIcon } from "@phosphor-icons/react"

export default function LoginPage() {
  const { mutate: login, isPending } = useAuthLogin()

  const handleGoogleLogin = useCallback(async () => {
    const mockGoogleToken = "mock_google_token_" + Date.now()
    login({ token: mockGoogleToken })
  }, [login])

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome to Verbly</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Sign in to start your vocabulary journey.
          </p>
        </div>

        <Button
          size="lg"
          onClick={handleGoogleLogin}
          disabled={isPending}
          className="w-full"
        >
          Sign in with Google{" "}
          {isPending ? (
            <SpinnerIcon />
          ) : (
            <Image
              src={"/assets/logos/google-g.png"}
              alt="Google Logo"
              width={16}
              height={16}
            />
          )}
        </Button>

        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          Don't have an account yet? No problem! We'll create one for you during
          sign-in.
        </p>
      </div>
    </div>
  )
}
