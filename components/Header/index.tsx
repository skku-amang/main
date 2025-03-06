"use client"
import { Knewave } from "next/font/google"
import Image from "next/image"
import Link from "next/link"

import Sidebar from "@/components/Header/_component/Sidebar"
import ROUTES, { DEFAULT_PERFORMANCE_ID } from "@/constants/routes"
import { cn } from "@/lib/utils"

import NavLink from "../NavLink"
import Profile from "./_component/Profile"

const knewave = Knewave({ subsets: ["latin"], weight: ["400"] })

const Header = ({
  position,
  height = "82px",
  mode = "light",
}: {
  position: "sticky" | "fixed"
  height: string
  mode?: "light" | "dark"
}) => {
  const menuItems: { name: string; url: string; active: boolean }[] = [
    { name: "소개", url: ROUTES.HOME, active: false },
    { name: "신청", url: ROUTES.HOME, active: false },
    { name: "모집", url: ROUTES.HOME, active: false },
    { name: "예약", url: ROUTES.PERFORMANCE.TEAM.LIST(DEFAULT_PERFORMANCE_ID), active: true },
    { name: "아카이브", url: ROUTES.PERFORMANCE.LIST, active: true },
  ]

  return (
    <header
      className={cn(
        position,
        "top-0 z-50 flex h-full w-full justify-center",
        mode === "dark" ? "bg-primary" : "bg-white",
      )}
      style={{ height }}
    >
      {/* Mobile */}
      <nav className="visible relative flex h-full w-11/12 items-center justify-between md:hidden">
        <div className="f-full w-9 bg-none"></div>
        <Link href={ROUTES.HOME}>
          <Image src="/Logo.png" alt="logo" width={50} height={50} />
        </Link>
        <Sidebar />
      </nav>

      {/* Tablet & Desktop */}
      <nav className="hidden h-full w-full items-center px-[87px] py-[21px] justify-between md:visible md:flex">
        {/* Logo */}
        <Link href={ROUTES.HOME} className={cn("text-primary text-[35px]", knewave.className)}>
          Amang
        </Link>

        <div className="flex gap-x-[35px] items-center justify-end">
          {/* MenuItems */}
          <div className="flex h-full justify-center gap-x-9">
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
