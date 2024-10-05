"use client"
import Image from "next/image"
import Link from "next/link"

import Sidebar from "@/components/Header/_component/Sidebar"

import ROUTES from "../../constants/routes"
import { cn } from "../../lib/utils"
import NavLink from "../NavLink"
import Profile from "./_component/Profile"

const Header = ({
  position,
  height
}: {
  position: "sticky" | "fixed"
  height: string
}) => {
  const menuItems: { name: string; url: string; active: boolean }[] = [
    { name: "공지사항", url: ROUTES.NOTICE.LIST.url, active: false },
    { name: "공연목록", url: ROUTES.PERFORMANCE.LIST.url, active: true },
    { name: "세션지원", url: ROUTES.TEAM.LIST.url, active: true },
    { name: "맴버목록", url: ROUTES.MEMBER.LIST.url, active: true }
  ]

  return (
    <header
      className={cn(
        position,
        "top-0 z-10 flex h-full w-full justify-center bg-primary"
      )}
      style={{ height }}
    >
      {/* Mobile */}
      <nav className="visible relative flex h-full w-11/12 items-center justify-between md:hidden">
        <div className="f-full w-9 bg-none"></div>
        <Link href={ROUTES.HOME.url}>
          <Image src="/Logo.png" alt="logo" width={50} height={50} />
        </Link>
        <Sidebar />
      </nav>

      {/* Tablet & Desktop */}
      <nav className="hidden h-full w-full items-center px-10 md:visible md:flex">
        <div className="mx-auto flex h-full w-full items-center justify-between lg:w-[1280px]">
          {/* Logo */}
          <Link href={ROUTES.HOME.url}>
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
