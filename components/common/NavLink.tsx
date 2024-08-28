'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { cn } from '../../lib/utils'

const NavLink = ({ href, children, active }: { href: string, children: React.ReactNode, active: boolean }) => {
  const pathname = usePathname()
  const parentPathname = pathname.split('/')[1]
  const hrefWithoutSlash = href.replaceAll("/", "")
  const activeClass = parentPathname === hrefWithoutSlash ? 'text-primary' : 'text-gray-300'
  return (
    <Link
      href={href}
      aria-disabled={!active}
      tabIndex={active ? undefined : -1}
      style={{
        pointerEvents: active ? 'auto' : 'none'
      }}
      className={cn('flex items-center font-extrabold hover:text-primary', activeClass)}>
      {children}
    </Link>
  )
}

export default NavLink
