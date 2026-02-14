"use client"

import { Equipment } from "@repo/shared-types"
import { EquipCategory } from "@repo/database"
import { MoreVertical, Pencil, Search, Trash2 } from "lucide-react"
import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import ROUTES from "@/constants/routes"

const CATEGORY_LABELS: Record<EquipCategory, string> = {
  [EquipCategory.ROOM]: "동아리방",
  [EquipCategory.SYNTHESIZER]: "신디사이저",
  [EquipCategory.MICROPHONE]: "마이크",
  [EquipCategory.GUITAR]: "기타",
  [EquipCategory.BASS]: "베이스",
  [EquipCategory.DRUM]: "드럼",
  [EquipCategory.AUDIO_INTERFACE]: "오디오 인터페이스",
  [EquipCategory.CABLE]: "케이블",
  [EquipCategory.AMPLIFIER]: "앰프",
  [EquipCategory.SPEAKER]: "스피커",
  [EquipCategory.MIXER]: "믹서",
  [EquipCategory.ETC]: "기타(그 외)"
}

interface EquipmentCardProps {
  equipment: Equipment
  isAdmin?: boolean
  onEdit?: (equipment: Equipment) => void
  onDelete?: (equipment: Equipment) => void
}

export default function EquipmentCard({
  equipment,
  isAdmin,
  onEdit,
  onDelete
}: EquipmentCardProps) {
  return (
    <div className="relative rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50">
      <Link
        href={`${ROUTES.RESERVATION.EQUIPMENT}/${equipment.id}`}
        className="flex gap-4"
      >
        {/* Image thumbnail */}
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
          {equipment.image ? (
            <img
              src={equipment.image}
              alt={`${equipment.brand} ${equipment.model}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Search size={20} className="opacity-50" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h3 className="font-semibold text-foreground">
            {equipment.brand}{" "}
            {CATEGORY_LABELS[equipment.category] ?? equipment.category}
          </h3>
          <div className="mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-sm">
            <span className="text-muted-foreground">모델명</span>
            <span className="truncate">{equipment.model}</span>
            <span className="text-muted-foreground">설명</span>
            <span className="truncate">{equipment.description || "-"}</span>
          </div>
        </div>
      </Link>

      {/* Admin kebab menu */}
      {isAdmin && (
        <div className="absolute right-2 top-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(equipment)}>
                <Pencil size={14} />
                수정하기
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(equipment)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 size={14} />
                삭제하기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
