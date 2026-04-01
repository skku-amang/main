"use client"

import { ChevronDown, Plus } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import ROUTES from "@/constants/routes"
import { usePerformances } from "@/hooks/api/usePerformance"
import { cn } from "@/lib/utils"

import { HeaderMode } from ".."

const headerColorClass = ({
  mode,
  isCurrentPathname
}: {
  mode: HeaderMode
  isCurrentPathname: boolean
}) => {
  const base = "transition-colors duration-200"

  switch (mode) {
    case "light":
      return cn(
        base,
        isCurrentPathname
          ? "text-primary hover:text-primary"
          : "text-gray-600 hover:text-primary"
      )
    case "dark":
      return cn(
        base,
        isCurrentPathname
          ? "text-white hover:text-white"
          : "text-gray-400 hover:text-white"
      )
    case "transparent":
      return cn(
        base,
        isCurrentPathname
          ? "text-gray-200 hover:text-white"
          : "text-gray-400 hover:text-white"
      )
  }
}

const TeamRecruitDropdown = ({ mode }: { mode: HeaderMode }) => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { data: performances } = usePerformances()
  const isCurrentPathname = pathname.includes("/performances/")
  const isEmpty = !performances || performances.length === 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="win-menuitem flex cursor-pointer items-center gap-x-1 outline-none"
        style={{ fontFamily: "Tahoma, sans-serif", fontSize: "11px" }}
      >
        팀 모집
        <ChevronDown className="h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="win-raised" style={{ background: "#d4d0c8", borderRadius: "0", padding: "2px", fontFamily: "Tahoma, sans-serif", fontSize: "11px", minWidth: "160px" }}>
        {isEmpty ? (
          <div className="px-3 py-1 text-xs" style={{ color: "#808080" }}>
            모집 중인 공연이 없습니다
          </div>
        ) : (
          performances.map((p) => (
            <DropdownMenuItem key={p.id} asChild className="cursor-pointer win-menuitem" style={{ fontSize: "11px" }}>
              <Link href={ROUTES.PERFORMANCE.TEAM.LIST(p.id)}>{p.name}</Link>
            </DropdownMenuItem>
          ))
        )}
        {session?.user?.isAdmin && (
          <>
            <DropdownMenuSeparator style={{ background: "#808080", margin: "2px 0" }} />
            <DropdownMenuItem asChild className="cursor-pointer win-menuitem" style={{ fontSize: "11px" }}>
              <Link
                href={ROUTES.ADMIN.PERFORMANCES}
                className="flex items-center gap-x-2"
              >
                <Plus className="h-3 w-3" />
                공연 관리
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TeamRecruitDropdown
