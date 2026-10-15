"use client"

import { EllipsisVertical, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"

import TeamDeleteButton from "@/components/TeamDeleteButton"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import ROUTES from "@/constants/routes"
import { cn } from "@/lib/utils"

interface TeamActionsMenuProps {
  performanceId: number
  teamId: number
  className?: string
}

/** 팀 편집·삭제 케밥 메뉴 (권한 확인은 호출하는 쪽에서) */
const TeamActionsMenu = ({
  performanceId,
  teamId,
  className
}: TeamActionsMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className={cn("flex items-center justify-center p-0", className)}
      >
        <span className="sr-only">편집·삭제 메뉴 열기</span>
        <EllipsisVertical className="h-5 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      className="rounded-lg border border-slate-100 p-[5px] text-base drop-shadow-[0_3px_6px_rgb(0,0,0,0.3)]"
    >
      <DropdownMenuItem
        asChild
        className="flex items-center justify-center gap-x-2 px-6 py-2 selection:text-slate-700 hover:cursor-pointer"
      >
        <Link href={ROUTES.PERFORMANCE.TEAM.EDIT(performanceId, teamId)}>
          <Pencil />
          편집하기
        </Link>
      </DropdownMenuItem>
      <TeamDeleteButton
        teamId={teamId}
        redirectUrl={ROUTES.PERFORMANCE.TEAM.LIST(performanceId)}
      >
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="flex items-center justify-center gap-x-2 px-6 py-2 selection:text-slate-700 hover:cursor-pointer"
        >
          <Trash2 />
          삭제하기
        </DropdownMenuItem>
      </TeamDeleteButton>
    </DropdownMenuContent>
  </DropdownMenu>
)

export default TeamActionsMenu
