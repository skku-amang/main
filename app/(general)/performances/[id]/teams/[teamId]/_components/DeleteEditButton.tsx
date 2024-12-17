"use client"

import { Edit3, Trash2 } from "lucide-react"
import Link from "next/link"

import TeamDeleteButton from "@/components/TeamDeleteButton"
import { Button } from "@/components/ui/button"
import ROUTES from "@/constants/routes"
import { Team } from "@/types/Team"

interface DeleteEditButtonProps {
  performanceId: number
  team: Team
  className?: string
  accessToken?: string
}

const DeleteEditButton = ({
  team,
  className
}: DeleteEditButtonProps) => {

  return (
    <div
      className={`flex items-center justify-center gap-x-3 ${className}`}
    >
      {/* 편집 버튼 */}
      <Button asChild variant="outline" className="shadow py-1 px-2">
        <Link
          className="text-white hover:animate-none"
          href={ROUTES.PERFORMANCE.TEAM.EDIT(team.performance.id, team.id)}
        >
          <Edit3 strokeWidth={1} size={20} className="text-gray-600" />
        </Link>
      </Button>

      {/* 삭제 버튼 */}
      <TeamDeleteButton teamId={team.id}>
        <div className="border p-2 shadow rounded-md transition-colors hover:bg-accent">
          <Trash2 strokeWidth={1} size={20} className="text-gray-600" />
        </div>
      </TeamDeleteButton>
    </div>
  )
}

export default DeleteEditButton
