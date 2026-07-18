"use client"

import Image from "next/image"

import { Button } from "@workspace/ui/components/button"
import { login } from "./actions"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const handleGoogleAuth = async () => {
    const url = await login()
    router.push(url)
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
            className="w-full"
          >
            Sign in with Google
            <Image
              src="/assets/logos/google-g.png"
              alt="Google Logo"
              width={16}
              height={16}
              className="ml-2"
            />
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
