import { redirect } from "next/navigation"
import { api } from "@/lib/api/api"
import { DashboardNav } from "./components/nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await api.get("/session")
  } catch {
    redirect("/auth")
  }

  return (
    <>
      {children}
      <DashboardNav />
    </>
  )
}
