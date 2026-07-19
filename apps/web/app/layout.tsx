import { Geist_Mono, Schibsted_Grotesk } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/providers/next-theme"
import { cn } from "@workspace/ui/lib/utils"

const schibstedGrotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        schibstedGrotesk.variable
      )}
    >
      <body>
        <Toaster />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
