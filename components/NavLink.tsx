"use client"

import { useSession } from "next-auth/react"
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
        ? "text-gray-200 hover:text-white"
        : "text-gray-400 hover:text-white"
      break
  }

  return `${defaultClass} ${className}`
}

const isCurrentPathname = (pathname: string, href: string) => {
  const pathnameWithoutSlash = pathname.replaceAll("/", "")
  const hrefWithoutSlash = href.replaceAll("/", "")

  return pathnameWithoutSlash === hrefWithoutSlash
}

interface NavLinkProps {
  href: string
  children: React.ReactNode
  isActive: boolean
  mode: HeaderMode
  isAdminOnly?: boolean
}

const NavLink = ({
  href,
  children,
  isActive,
  mode,
  isAdminOnly = false
}: NavLinkProps) => {
  const pathname = usePathname()
  const { data } = useSession()
  const isAvailable = data?.is_admin || (!isAdminOnly && isActive)

  if (isAdminOnly && !data?.is_admin) {
    return null
  }

  return (
    <Link
      href={href}
      aria-disabled={!isAvailable}
      tabIndex={isAvailable ? undefined : -1}
      className={cn(
        "flex items-center text-lg font-semibold",
        !isAvailable && "pointer-events-none",
        headerColorClass({
          mode,
          isActive: isAvailable,
          isCurrentPathname: isCurrentPathname(pathname, href)
        })
      )}
    >
      {children}
    </Link>
  )
}

export default NavLink
