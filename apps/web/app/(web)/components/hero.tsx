import { buttonVariants } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRightIcon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { meta } from "@workspace/data/meta"

export const Hero = () => {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-20">
      <div className="mx-auto max-w-3xl space-y-8 text-center">
        <div className="inline-block">
          <div className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-xs font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
            Proudly Open Source ⚡
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Expand your vocabulary
          </h1>

          <p className="mx-auto max-w-2xl text-xl text-neutral-600 dark:text-neutral-400">
            {meta.description}
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
          <Link
            href="/auth"
            className={`md:px-12 ${buttonVariants({ size: "lg" })}`}
          >
            Get Started
            <HugeiconsIcon icon={ArrowRightIcon} />
          </Link>
        </div>
      </div>
    </section>
  )
}
