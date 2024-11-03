import Link from "next/link"
import React, { HTMLAttributeAnchorTarget } from "react"

interface SheetInnerContentNavLinkProps {
  href: string
  target?: HTMLAttributeAnchorTarget
  rel?: string
  icon: React.ReactNode
  children: React.ReactNode
}

const SheetInnerContentNavLink = ({ href, target, rel, icon, children }: SheetInnerContentNavLinkProps) => {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className="flex w-full items-center text-gray-500 gap-x-4"
    >
      {icon}
      <div className="text-lg font-medium">
        {children}
      </div>
    </Link>
  )
}

export default SheetInnerContentNavLink