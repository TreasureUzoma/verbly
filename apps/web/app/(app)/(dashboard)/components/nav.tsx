"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HouseIcon,
  UserIcon,
  HeartIcon,
  ArrowCounterClockwiseIcon,
  SparkleIcon,
} from "@phosphor-icons/react"

export function DashboardNav() {
  const pathname = usePathname()

  const navItems = [
    {
      label: "Learn",
      icon: HouseIcon,
      href: "/home",
    },
    {
      label: "Coach",
      icon: SparkleIcon,
      href: "/coach",
    },
    {
      label: "Saved",
      icon: HeartIcon,
      href: "/saved",
    },
    {
      label: "You",
      icon: UserIcon,
      href: "/profile",
    },
  ]

  return (
    <nav className="fixed right-0 bottom-0 left-0 border-t border-neutral-600">
      <div className="flex h-20 items-center justify-around px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-full flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                isActive
                  ? "text-foreground"
                  : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              <Icon size={24} weight={isActive ? "fill" : "regular"} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
