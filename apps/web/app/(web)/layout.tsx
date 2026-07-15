import { Nav } from "./components/nav"
import { Footer } from "./components/footer"

export default function WebLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="framernoise-bg flex min-h-screen flex-col">
      <Nav />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  )
}
