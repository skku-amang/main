"use client"

import { Knewave } from "next/font/google"
import Image from "next/image"
import Link from "next/link"

import MobileBackButton from "@/components/Header/_component/MobileBackButton"
import Sidebar from "@/components/Header/_component/Sidebar"
import ROUTES, { DEFAULT_PERFORMANCE_ID } from "@/constants/routes"
import { cn } from "@/lib/utils"

import NavLink from "../NavLink"
import Profile from "./_component/Profile"

const knewave = Knewave({ subsets: ["latin"], weight: ["400"] })

export type HeaderMode = "light" | "dark" | "transparent"
type MenuItem = {
  name: string
  url: string
  active: boolean
}

const Header = ({
  position,
  height = "82px",
  mode = "light"
}: {
  position: "sticky" | "fixed"
  height: string
  mode?: HeaderMode
}) => {
  const menuItems: MenuItem[] = [
    {
      name: "팀 모집",
      url: ROUTES.PERFORMANCE.TEAM.LIST(DEFAULT_PERFORMANCE_ID),
      active: true
    },
    {
      name: "공간 대여",
      url: ROUTES.RESERVATION.CLUBROOM,
      active: false
    },
    {
      name: "물품 대여",
      url: ROUTES.RESERVATION.EQUIPMENT,
      active: false
    },
    { name: "아카이브", url: ROUTES.PERFORMANCE.LIST, active: true }
  ]

  return (
    <header
      className={cn(
        position,
        "top-0 z-50 flex h-full w-full justify-center backdrop-blur-sm",
        {
          "bg-white": mode === "light",
          "bg-primary": mode === "dark",
          "bg-transparent": mode === "transparent"
        }
      )}
      style={{ height }}
    >
      {/* Mobile */}
      <nav
        className={cn(
          "visible relative flex h-full w-full items-center justify-between px-10 py-2 md:hidden",
          {
            "bg-white": mode === "light",
            "bg-primary": mode === "dark",
            "bg-transparent": mode === "transparent"
          }
        )}
      >
        <MobileBackButton />
        <Link href={ROUTES.HOME}>
          <Image src="/Logo.png" alt="logo" width={32} height={32} />
        </Link>
        <Sidebar />
      </nav>

      {/* Tablet & Desktop */}
      <nav className="hidden h-full w-full items-center justify-between px-[87px] py-[21px] md:visible md:flex">
        {/* Logo */}
        <Link
          href={ROUTES.HOME}
          className={cn("text-[35px]", knewave.className, {
            "text-white": mode === "transparent" || mode === "dark",
            "text-primary": mode === "light"
          })}
        >
          Amang
        </Link>

        <div className="flex items-center justify-end gap-x-[35px]">
          {/* MenuItems */}
          <div className="flex h-full justify-center gap-x-9">
            {menuItems.map((menuItem) => (
              <NavLink
                key={menuItem.name}
                href={menuItem.url}
                isActive={menuItem.active}
                mode={mode}
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
