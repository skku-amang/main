"use client"

import { useState } from "react"
import { Equipment } from "@repo/shared-types"
import { EquipCategory } from "@repo/database/enums"
import { MoreVertical, Pencil, ScanSearch, Search, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import * as DialogPrimitive from "@radix-ui/react-dialog"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog"
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
  const [imageOpen, setImageOpen] = useState(false)

  return (
    <>
      <div className="relative rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50 md:h-[172px]">
        <Link
          href={`${ROUTES.RESERVATION.EQUIPMENT}/${equipment.id}`}
          className="flex h-full gap-4"
        >
          {/* Image thumbnail */}
          <div className="group/img relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted md:h-full md:w-auto md:aspect-square">
            {equipment.image ? (
              <>
                <img
                  src={equipment.image}
                  alt={`${equipment.brand} ${equipment.model}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setImageOpen(true)
                  }}
                  className="absolute bottom-1 right-1 hidden rounded-full bg-white/90 p-1 text-slate-800 shadow-md transition-opacity group-hover/img:opacity-100 md:block md:opacity-0"
                >
                  <ScanSearch size={14} />
                </button>
              </>
            ) : (
              <div
                role="img"
                aria-label="이미지 없음"
                className="flex h-full w-full items-center justify-center text-muted-foreground"
              >
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
            <div className="mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-sm text-muted-foreground">
              <span className="font-medium">모델명</span>
              <span className="truncate text-right">{equipment.model}</span>
              <span className="font-medium">설명</span>
              <span className="truncate text-right">
                {equipment.description || "-"}
              </span>
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
              <DropdownMenuContent
                align="end"
                className="rounded-lg border border-slate-100 p-[5px] text-base drop-shadow-[0_3px_6px_rgb(0,0,0,0.3)]"
              >
                <DropdownMenuItem
                  onClick={() => onEdit?.(equipment)}
                  className="flex items-center justify-center gap-x-2 px-6 py-2 hover:cursor-pointer"
                >
                  <Pencil />
                  수정하기
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(equipment)}
                  className="flex items-center justify-center gap-x-2 px-6 py-2 text-destructive focus:text-destructive hover:cursor-pointer"
                >
                  <Trash2 />
                  삭제하기
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Image lightbox */}
      {equipment.image && (
        <Dialog open={imageOpen} onOpenChange={setImageOpen}>
          <DialogPortal>
            <DialogOverlay
              className="cursor-pointer bg-black/90"
              onClick={() => setImageOpen(false)}
            />
            <DialogPrimitive.Content
              className="fixed inset-0 z-50 flex items-center justify-center p-8"
              onClick={() => setImageOpen(false)}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <DialogPrimitive.Title className="sr-only">
                {equipment.brand} {equipment.model} 이미지
              </DialogPrimitive.Title>
              <div
                className="relative h-full w-full max-w-3xl"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={equipment.image}
                  alt={`${equipment.brand} ${equipment.model}`}
                  fill
                  className="object-contain"
                />
              </div>
            </DialogPrimitive.Content>
          </DialogPortal>
        </Dialog>
      )}
    </>
  )
}
