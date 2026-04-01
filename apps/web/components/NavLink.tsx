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
  const isAvailable = data?.user?.isAdmin || (!isAdminOnly && isActive)

  if (isAdminOnly && !data?.user?.isAdmin) {
    return null
  }

  return (
    <Link
      href={href}
      aria-disabled={!isAvailable}
      tabIndex={isAvailable ? undefined : -1}
      className={cn(
        "win-menuitem flex items-center text-sm",
        !isAvailable && "pointer-events-none opacity-40",
        isCurrentPathname(pathname, href) && "active"
      )}
      style={{ fontFamily: "Tahoma, sans-serif", fontSize: "11px", textDecoration: "none" }}
    >
      {children}
    </Link>
  )
}

export default NavLink
