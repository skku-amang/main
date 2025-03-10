"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

import { headerColorClass, HeaderMode } from "@/components/Header"
import { cn } from "@/lib/utils"

const isCurrentPathname = (pathname: string, href: string) => {
  const pathnameWithoutSlash = pathname.replaceAll("/", "")
  const hrefWithoutSlash = href.replaceAll("/", "")

  return pathnameWithoutSlash === hrefWithoutSlash
}

const NavLink = ({
  href,
  children,
  isActive,
  mode
}: {
  href: string
  children: React.ReactNode
  isActive: boolean
  mode: HeaderMode
}) => {
  const pathname = usePathname()

  return (
    <Link
      href={href}
      aria-disabled={!isActive}
      tabIndex={isActive ? undefined : -1}
      className={cn(
        "flex items-center text-lg font-semibold",
        !isActive && "pointer-events-none",
        headerColorClass({
          mode,
          isActive,
          isCurrentPathname: isCurrentPathname(pathname, href)
        })
      )}
    >
      {children}
    </Link>
  )
}

export default NavLink
