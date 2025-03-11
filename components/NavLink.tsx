"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

import { HeaderMode } from "@/components/Header"
import { cn } from "@/lib/utils"

const headerColorClass = ({
  mode,
  isActive = true,
  isCurrentPathname = false
}: {
  mode: HeaderMode
  isActive?: boolean
  isCurrentPathname?: boolean
}) => {
  if (!isActive) {
    return "text-gray-600"
  }

  const defaultClass = "transition-colors duration-200"
  let className = ""

  switch (mode) {
    case "light":
      className = isCurrentPathname
        ? "text-primary hover:text-primary"
        : "text-gray-600 hover:text-primary"
      break
    case "dark":
      className = isCurrentPathname
        ? "text-white hover:text-white"
        : "text-gray-400 hover:text-white"
      break
    case "transparent":
      className = isCurrentPathname
        ? "text-gray-400 hover:text-primary"
        : "text-gray-200 hover:text-white"
      break
  }

  return `${defaultClass} ${className}`
}

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
