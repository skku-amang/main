"use client"

import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  const { data: performances } = usePerformances()
  const isCurrentPathname = pathname.includes("/performances/")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-x-1 text-lg font-semibold outline-none",
          headerColorClass({ mode, isCurrentPathname })
        )}
      >
        팀 모집
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {performances?.map((p) => (
          <DropdownMenuItem key={p.id} asChild className="cursor-pointer">
            <Link href={ROUTES.PERFORMANCE.TEAM.LIST(p.id)}>{p.name}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TeamRecruitDropdown
