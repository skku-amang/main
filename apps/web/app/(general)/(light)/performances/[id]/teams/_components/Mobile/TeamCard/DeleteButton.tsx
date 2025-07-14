"use client"

import { Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import useTeamDelete from "@/hooks/useTeamDelete"
import { cn } from "@/lib/utils"

interface TeamCardDeleteButtonProps {
  teamId: number
  className?: string
}

const TeamCardDeleteButton = ({
  teamId,
  className
}: TeamCardDeleteButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { deleteTeam } = useTeamDelete()

  const onDelete = async () => {
    const res = await deleteTeam(teamId)
    if (res) {
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "flex h-9 flex-1 items-center gap-x-2 rounded-lg bg-slate-100 text-xs text-primary drop-shadow-sm",
            className
          )}
          variant="destructive"
        >
          <Trash2 size={14} strokeWidth={2} className="font-bold" />
          삭제하기
        </Button>
      </DialogTrigger>
      <DialogContent className="inline-flex w-[343px] flex-col items-center justify-start rounded-xl shadow p-4">
        {/* 삭제 아이콘 및 메시지 */}
        <div className="flex flex-col items-start justify-start gap-2 self-stretch pt-5">
          {/* 삭제 아이콘 */}
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-[28px] border-8 border-red-50 bg-red-100 p-3">
            <div className="relative flex h-6 w-6 flex-col items-start justify-center">
              <Trash2 className="text-destructive" size={20} />
            </div>
          </div>

          {/* 삭제 메시지 */}
          <div className="flex flex-col items-start justify-start gap-2 self-stretch">
            <DialogTitle className="self-stretch  text-lg font-semibold leading-7 text-gray-900">
              정말 삭제하시겠습니까?
            </DialogTitle>
            <DialogDescription className="self-stretch text-sm font-normal text-slate-600">
              삭제된 게시글은 복구할 수 없습니다.
              <br />
              그래도 삭제하시겠습니까?
            </DialogDescription>
          </div>
        </div>

        {/* 확인, 취소 버튼 */}
        <div className="flex flex-col items-start justify-start gap-2 self-stretch">
          <Button
            onClick={onDelete}
            variant="destructive"
            className="font-semibold w-full inline-flex items-center justify-center gap-2 self-stretch rounded-lg px-[18px] py-2.5 shadow"
          >
            확인
          </Button>
          <Button
            variant="outline"
            className="font-semibold w-full inline-flex items-center justify-center gap-2 self-stretch rounded-lg border border-gray-300 px-[18px] py-2.5 shadow text-gray-700"
          >
            취소
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TeamCardDeleteButton
