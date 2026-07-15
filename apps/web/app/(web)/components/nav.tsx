import { GithubIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { meta } from "@workspace/data/meta"
import React from "react"

export const Nav = () => {
  return (
    <nav className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-8 py-5">
      <h3 className="text-[1.4rem] font-bold">{meta.name}.</h3>
      <a href={meta.github} target="_blank">
        <HugeiconsIcon icon={GithubIcon} />
      </a>
    </nav>
  )
}
