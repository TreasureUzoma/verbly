import { GithubIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { meta } from "@workspace/data/meta"

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-3 gap-4 sm:flex sm:items-center sm:justify-between">
          <p className="col-span-2 text-sm text-neutral-600 dark:text-neutral-400">
            © {currentYear} Verbly
          </p>
          <div className="flex items-center justify-end gap-4 sm:justify-start">
            <a
              href="/privacy"
              className="text-sm text-neutral-600 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Privacy
            </a>
            <a
              href={meta.developer.website}
              className="text-sm text-neutral-600 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Developer
            </a>
            <a
              href={meta.github}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:opacity-60"
              aria-label="GitHub"
            >
              <HugeiconsIcon icon={GithubIcon} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
