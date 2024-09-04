'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import ROUTES from '../../../constants/routes'
import { cn } from '../../../lib/utils'
import NavLink from '../NavLink'
import Profile from './Profile'

const Header = ({
  position,
  height
}: {
  position: 'sticky' | 'fixed'
  height: string
}) => {
  const menuItems: { name: string; url: string; active: boolean }[] = [
    { name: '공지사항', url: ROUTES.NOTICE.LIST.url, active: false },
    { name: '공연목록', url: ROUTES.PERFORMANCE.LIST.url, active: true },
    { name: '세션지원', url: ROUTES.TEAM.LIST.url, active: true },
    { name: '맴버목록', url: ROUTES.MEMBER.LIST.url, active: true }
  ]

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <header
      className={cn(
        position,
        'top-0 z-10 flex h-full w-full justify-center bg-primary backdrop-blur'
      )}
      style={{ height }}
    >
      {/* Mobile */}
      <nav className="flex  w-full items-center justify-between md:hidden">
        <div
          className="h-full flex-col items-center justify-center pl-4"
          onClick={() => setIsSidebarOpen(true)}
        >
          <div className="flex h-full flex-col justify-center gap-[0.3rem]">
            <div className="h-[0.2rem] w-8 bg-white"></div>
            <div className="h-[0.2rem] w-8 bg-white"></div>
            <div className="h-[0.2rem] w-8 bg-white"></div>
          </div>
        </div>
        <div className="fixed ml-[45%] flex items-center">
          <Link href={ROUTES.HOME.url}>
            <Image src="/Logo.png" alt="logo" width={47} height={47} />
          </Link>
        </div>
        <div className="mr-10"></div>
      </nav>

      {/* 열리는 창 안에 있는 것들 고생이 많아 장수*/}
      <div
        className={`fixed left-0 top-0 flex h-screen w-[43%] transform flex-col justify-center bg-gray-800 text-white ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}
      >
        <div className="flex h-[90%] flex-col items-start justify-center">
          <Link
            href={ROUTES.NOTICE.LIST.url}
            className="flex w-full flex-1 items-center justify-center text-2xl font-black"
          >
            공지사항
          </Link>
          <Link
            href={ROUTES.PERFORMANCE.LIST.url}
            className="flex w-full flex-1 items-center justify-center text-2xl font-black"
          >
            공연목록
          </Link>
          <Link
            href={ROUTES.TEAM.LIST.url}
            className="flex w-full flex-1 items-center justify-center text-2xl font-black"
          >
            세션지원
          </Link>
          <Link
            href={ROUTES.MEMBER.LIST.url}
            className="flex w-full flex-1 items-center justify-center text-2xl font-black"
          >
            멤버목록
          </Link>
        </div>
        <div className="flex-1 justify-center">
          <Profile />
        </div>
      </div>
      {isSidebarOpen && (
        <div
          className="h-screen w-full"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Tablet & Desktop */}
      <nav className="hidden h-full w-full items-center px-10 md:visible md:flex">
        <div className="mx-auto flex h-full w-full items-center justify-between lg:w-[1280px]">
          {/* Logo */}
          <Link href="/">
            <Image src="/Logo.png" alt="logo" width={47} height={47} />
          </Link>

          {/* MenuItems */}
          <div className="flex h-full justify-center md:gap-x-7 lg:gap-x-16 xl:gap-x-24">
            {menuItems.map((menuItem) => (
              <NavLink
                key={menuItem.name}
                href={menuItem.url}
                active={menuItem.active}
              >
                {menuItem.name}
              </NavLink>
            ))}
          </div>

          {/* Personal */}
          <Profile />
        </div>
      </nav>
    </header>
  )
}

export default Header
