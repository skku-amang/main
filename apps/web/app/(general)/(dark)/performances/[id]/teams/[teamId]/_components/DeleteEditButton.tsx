"use client"

import { Edit3, Trash2 } from "lucide-react"
import Link from "next/link"

import TeamDeleteButton from "@/components/TeamDeleteButton"
import { Button } from "@/components/ui/button"
import ROUTES from "@/constants/routes"
import { TeamDetail } from "@repo/shared-types"

interface DeleteEditButtonProps {
  performanceId: number
  team: TeamDetail
  className?: string
  accessToken?: string
}

const DeleteEditButton = ({ team, className }: DeleteEditButtonProps) => {
  return (
    <div className={`flex items-center justify-center gap-x-3 ${className}`}>
      {/* 편집 버튼 */}
      <Button asChild variant="outline" className="px-2 py-1 shadow">
        <Link
          className="text-white hover:animate-none"
          href={ROUTES.PERFORMANCE.TEAM.EDIT(team.performanceId, team.id)}
        >
          <Edit3 strokeWidth={1} size={20} className="text-gray-600" />
        </Link>
      </Button>

      {/* 삭제 버튼 */}
      <TeamDeleteButton
        teamId={team.id}
        redirectUrl={ROUTES.PERFORMANCE.TEAM.LIST(team.performanceId)}
      >
        <div className="rounded-md border p-2 shadow transition-colors hover:bg-accent">
          <Trash2 strokeWidth={1} size={20} className="text-gray-600" />
        </div>
      </TeamDeleteButton>
    </div>
  )
}

export default DeleteEditButton
