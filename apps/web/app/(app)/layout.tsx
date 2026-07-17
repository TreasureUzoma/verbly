import { MobileOnlyOverlay } from "./components/mobile-only-overlay"

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <MobileOnlyOverlay />
      {children}
    </>
  )
}
