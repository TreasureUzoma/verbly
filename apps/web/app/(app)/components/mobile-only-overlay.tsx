"use client"

import { useEffect, useState } from "react"

export function MobileOnlyOverlay() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (isMobile === null) return null
  if (isMobile) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
      <div className="mx-4 max-w-sm rounded-lg bg-foreground p-8 text-center text-background">
        <h1 className="mb-4 text-2xl font-bold">Mobile Only</h1>
        <p className="mb-6">
          This app is optimized for mobile devices. Please access it from your
          phone or use a mobile device.
        </p>
        <div className="text-sm">
          Current screen width: {window?.innerWidth}px
        </div>
      </div>
    </div>
  )
}
