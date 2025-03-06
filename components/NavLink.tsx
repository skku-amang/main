'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { cn } from '../lib/utils'

const NavLink = ({
  href,
  children,
  active
}: {
  href: string
  children: React.ReactNode
  active: boolean
}) => {
  const pathname = usePathname() // 주소 가져오기
  const parentPathname = pathname.split('/')[1] // 주소를 가져와서 어디 페이지인지 판별
  const hrefWithoutSlash = href.replaceAll('/', '') // 주소에서 /을 모두 제거
  const activeClass =
    parentPathname === hrefWithoutSlash ? 'text-primary' : 'text-gray-600' // 현재 있는 페이지의 버튼만 흰색

  return (
    <Link
      href={href}
      aria-disabled={!active}
      tabIndex={active ? undefined : -1}
      style={{
        pointerEvents: active ? 'auto' : 'none'
      }}
      className={cn(
        'flex items-center font-semibold text-lg hover:text-primary',
        activeClass
      )}
    >
      {children}
    </Link>
  )
}

export default NavLink
