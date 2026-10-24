"use client"

import { useState } from "react"
import dayjs from "dayjs"
import { ArrowRight, Clock, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import { RentalDetail } from "@repo/shared-types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/hooks/use-toast"
import ROUTES from "@/constants/routes"
import { useDeleteRental } from "@/hooks/api/useRental"
import { useAuth } from "@/lib/providers/auth-provider"

const ParticipantChip = ({ user }: { user: RentalDetail["users"][number] }) => (
  <Link
    href={ROUTES.MEMBER_PROFILE(user.id)}
    className="flex w-[140px] items-center gap-1 rounded-lg border px-2 py-1.5 transition-colors hover:bg-slate-50"
    style={{
      borderColor: "rgba(197, 197, 197, 0.5)",
      borderWidth: "0.5px"
    }}
  >
    <Avatar className="h-6 w-6 shrink-0">
      {user.image && <AvatarImage src={user.image} />}
      <AvatarFallback className="text-[10px]">
        {user.name?.slice(0, 2)}
      </AvatarFallback>
    </Avatar>
    <span className="truncate text-xs font-medium" style={{ color: "#7E7E7E" }}>
      {user.name}
    </span>
  </Link>
)

interface RentalDetailModalProps {
  rental: RentalDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (rental: RentalDetail) => void
}

export default function RentalDetailModal({
  rental,
  open,
  onOpenChange,
  onEdit
}: RentalDetailModalProps) {
  const { user } = useAuth()
  const deleteRental = useDeleteRental()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!rental) return null

  const currentUserId = user?.id ?? null
  const canManage =
    rental.users.some((u) => u.id === currentUserId) || user?.isAdmin === true

  const handleDelete = () => {
    deleteRental.mutate([rental.id], {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["rentals"] })
        onOpenChange(false)
        toast({ title: "예약이 삭제되었습니다." })
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "삭제 실패",
          description: error.detail ?? error.message
        })
      }
    })
  }

  const start = dayjs(rental.startAt)
  const end = dayjs(rental.endAt)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[486px] rounded-3xl border-0 bg-[#F0FDF4] p-6 gap-4 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.05),0px_4px_50px_0px_rgba(0,0,0,0.08)]"
        // 첫 버튼(참여자·삭제)에 포커스가 가 엔터 한 번에 지워지지 않게
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex-row items-center justify-between gap-1.5">
          <DialogTitle
            className="text-2xl font-semibold"
            style={{ color: "#14532D" }}
          >
            {rental.title}
          </DialogTitle>
          {/* 시안에 설명 자리가 없어 화면에는 숨기고 스크린리더에만 전달 */}
          <DialogDescription className="sr-only">
            예약 시간과 예약자 정보입니다. 본인 예약이면 수정·삭제할 수
            있습니다.
          </DialogDescription>
        </DialogHeader>

        {/* Time section */}
        <div className="flex items-center justify-between gap-3 px-1.5">
          {/* From */}
          <div className="flex items-center gap-2">
            <Clock
              size={24}
              className="shrink-0"
              style={{ color: "#15803D" }}
            />
            <div>
              <p className="text-xl font-bold" style={{ color: "#374151" }}>
                {start.format("HH:mm")}
              </p>
              <p className="text-xs font-normal" style={{ color: "#4B5563" }}>
                {start.format("dddd, MMMM DD, YYYY")}
              </p>
            </div>
          </div>

          {/* Arrow */}
          <ArrowRight
            size={32}
            className="shrink-0"
            style={{ color: "#15803D" }}
          />

          {/* To */}
          <div className="flex items-center gap-2">
            <Clock
              size={24}
              className="shrink-0"
              style={{ color: "#15803D" }}
            />
            <div>
              <p className="text-xl font-bold" style={{ color: "#374151" }}>
                {end.format("HH:mm")}
              </p>
              <p className="text-xs font-normal" style={{ color: "#4B5563" }}>
                {end.format("dddd, MMMM DD, YYYY")}
              </p>
            </div>
          </div>
        </div>

        {/* Participants */}
        {rental.users && rental.users.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium" style={{ color: "#71717A" }}>
              참여자
            </p>
            <div className="flex flex-wrap gap-1.5">
              {rental.users.map((user) => (
                <ParticipantChip key={user.id} user={user} />
              ))}
            </div>
          </div>
        )}
        {canManage && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleteRental.isPending}
            >
              <Trash2 size={14} className="mr-1.5" />
              {deleteRental.isPending ? "삭제 중..." : "삭제"}
            </Button>
            <Button size="sm" className="flex-1" onClick={() => onEdit(rental)}>
              <Pencil size={14} className="mr-1.5" />
              수정
            </Button>
          </div>
        )}
      </DialogContent>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예약을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{rental.title}&rdquo; 예약이 영구적으로 삭제됩니다. 이
              작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
