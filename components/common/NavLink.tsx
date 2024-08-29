'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { cn } from '../../lib/utils'

const NavLink = ({ href, children, active }: { href: string, children: React.ReactNode, active: boolean }) => {
  const pathname = usePathname()
  const parentPathname = pathname.split('/')[1]
  const hrefWithoutSlash = href.replaceAll("/", "")
  const activeClass = parentPathname === hrefWithoutSlash ? 'text-white' : 'text-gray-400'
  const hoverClass = "hover:border-b-[0.2rem] hover:border-t-[0.2rem] hover:border-t-primary hover:border-b-white hover:text-white"

  return (
    <Link
      href={href}
      aria-disabled={!active}
      tabIndex={active ? undefined : -1}
      style={{
        pointerEvents: active ? 'auto' : 'none'
      }}
      className={cn('flex-1 flex items-center font-extrabold px-3', activeClass, hoverClass)}>
      {children}
    </Link>
  )
}

export default NavLink
