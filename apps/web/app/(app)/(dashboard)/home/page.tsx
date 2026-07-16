"use client"

import { useGetSession } from "@/hooks/use-session"

export default function HomePage() {
  const { data: user, isLoading, error } = useGetSession()
  return <div>{isLoading ? <p>Loading...</p> : <p>Hi {user?.name}!</p>}</div>
}
