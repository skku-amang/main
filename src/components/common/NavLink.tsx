'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import React from 'react'

const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => {
  const pathname = usePathname()
  const parentPathname = pathname.split('/')[1]
  const hrefWithoutSlash = href.substring(1)
  const activeClass = parentPathname === hrefWithoutSlash ? 'text-primary' : 'text-gray-300'
  return (
    <Link href={href} className={cn('flex items-center font-extrabold hover:text-primary', activeClass)}>
      {children}
    </Link>
  )
}

export default NavLink
