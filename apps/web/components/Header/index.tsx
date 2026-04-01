"use client"

import { Knewave } from "next/font/google"
import Link from "next/link"

import MobileBackButton from "@/components/Header/_component/MobileBackButton"
import Sidebar from "@/components/Header/_component/Sidebar"
import ROUTES from "@/constants/routes"
import { cn } from "@/lib/utils"

import NavLink from "../NavLink"
import Profile from "./_component/Profile"
import TeamRecruitDropdown from "./_component/TeamRecruitDropdown"

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
      name: "공간 대여",
      url: ROUTES.RESERVATION.CLUBROOM,
      active: true
    },
    {
      name: "물품 대여",
      url: ROUTES.RESERVATION.EQUIPMENT,
      active: true
    },
    { name: "아카이브", url: ROUTES.PERFORMANCE.LIST, active: true }
  ]

  return (
    <header
      className={cn(position, "top-0 z-50 w-full")}
      style={{ height }}
    >
      {/* Mobile */}
      <nav
        className="visible flex h-full w-full items-center justify-between px-4 md:hidden"
        style={{ background: "linear-gradient(to bottom, #1f6fb5, #1259a8)", borderTop: "1px solid #5392d0" }}
      >
        <MobileBackButton />
        <Link
          href={ROUTES.HOME}
          className={cn("text-xl font-bold text-white", knewave.className)}
        >
          Amang
        </Link>
        <Sidebar />
      </nav>

      {/* Desktop Win2000 Menu Bar */}
      <div className="hidden h-full flex-col md:flex" style={{ background: "#d4d0c8" }}>
        {/* Title-bar style top band */}
        <div
          className="flex items-center justify-between px-2"
          style={{
            background: "linear-gradient(to right, #0a246a, #a6caf0)",
            height: "20px",
            minHeight: "20px"
          }}
        >
          <div className="flex items-center gap-1">
            {/* Classic IE/globe icon placeholder */}
            <span style={{ fontSize: "10px", color: "white", fontWeight: "bold" }}>
              🎵
            </span>
            <span style={{ fontSize: "11px", color: "white", fontWeight: "bold", fontFamily: "Tahoma, sans-serif" }}>
              Amang - 성균관대학교 자유음악동아리
            </span>
          </div>
          <div className="flex items-center gap-px">
            <span
              className="win-ctrl-btn"
              title="Minimize"
              style={{ fontSize: "8px", lineHeight: 1 }}
            >
              _
            </span>
            <span
              className="win-ctrl-btn"
              title="Maximize"
              style={{ fontSize: "8px", lineHeight: 1 }}
            >
              □
            </span>
            <span
              className="win-ctrl-btn"
              title="Close"
              style={{ fontSize: "9px", fontWeight: "bold", lineHeight: 1 }}
            >
              ✕
            </span>
          </div>
        </div>

        {/* Classic Menu Bar */}
        <div
          className="flex items-center"
          style={{
            background: "#d4d0c8",
            borderBottom: "1px solid #808080",
            padding: "1px 4px",
            height: "20px",
            minHeight: "20px"
          }}
        >
          {/* Logo as "File" menu */}
          <Link
            href={ROUTES.HOME}
            className="win-menuitem font-bold underline"
            style={{ fontFamily: "Tahoma, sans-serif", fontSize: "11px" }}
          >
            Amang
          </Link>
          <div className="h-4 w-px mx-1" style={{ background: "#808080" }} />
          <TeamRecruitDropdown mode="light" />
          {menuItems.map((menuItem) => (
            <NavLink
              key={menuItem.name}
              href={menuItem.url}
              isActive={menuItem.active}
              mode="light"
            >
              {menuItem.name}
            </NavLink>
          ))}
        </div>

        {/* Toolbar (Address bar style) */}
        <div
          className="flex items-center gap-2 px-2"
          style={{
            background: "#d4d0c8",
            borderBottom: "2px solid #808080",
            height: "calc(100% - 40px)",
            flex: 1
          }}
        >
          {/* Back / Forward buttons */}
          <button className="win-btn" style={{ minWidth: "50px", fontSize: "10px" }}>
            ◀ Back
          </button>
          <button className="win-btn" style={{ minWidth: "50px", fontSize: "10px" }}>
            Forward ▶
          </button>
          <button className="win-btn" style={{ minWidth: "40px", fontSize: "10px" }}>
            🔄
          </button>

          {/* Address bar */}
          <div
            className="flex flex-1 items-center gap-1"
          >
            <span style={{ fontSize: "11px", color: "#000", whiteSpace: "nowrap", fontFamily: "Tahoma, sans-serif" }}>
              Address
            </span>
            <div
              className="flex flex-1 items-center px-1"
              style={{
                background: "white",
                border: "2px inset #808080",
                height: "20px",
                borderTop: "1px solid #404040",
                borderLeft: "1px solid #404040",
                borderRight: "1px solid #ffffff",
                borderBottom: "1px solid #ffffff",
                boxShadow: "inset 1px 1px 0 #808080"
              }}
            >
              <span style={{ fontSize: "11px", color: "#0000aa", fontFamily: "Tahoma, sans-serif" }}>
                http://amang.skku.ac.kr/
              </span>
            </div>
            <button className="win-btn" style={{ minWidth: "32px", fontSize: "10px" }}>
              Go
            </button>
          </div>

          {/* Profile */}
          <Profile />
        </div>
      </div>
    </header>
  )
}

export default Header
