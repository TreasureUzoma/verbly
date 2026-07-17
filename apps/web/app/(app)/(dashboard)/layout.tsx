"use client"

import { DashboardNav } from "./components/nav"
import { useGetSession } from "@/hooks/use-session"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { SpinnerGapIcon } from "@phosphor-icons/react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: user, isLoading, isError } = useGetSession()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || isError)) {
      router.push("/auth")
    }
  }, [user, isLoading, isError, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <SpinnerGapIcon className="animate-spin" size={32} />
      </div>
    )
  }

  if (!user || isError) {
    return null
  }

  return (
    <>
      {children}
      <DashboardNav />
    </>
  )
}
