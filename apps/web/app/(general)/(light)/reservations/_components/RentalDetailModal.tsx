"use client"

import "dayjs/locale/ko"

import { useRef, useState } from "react"
import dayjs, { Dayjs } from "dayjs"
import { Clock, MapPin, Pencil, Trash2, UserRound } from "lucide-react"
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
import { getRentalColor } from "./rentalColors"

type ChipUser = Pick<RentalDetail["users"][number], "id" | "name" | "image">

const ParticipantChip = ({ user }: { user: ChipUser }) => (
  <Link
    href={ROUTES.MEMBER_PROFILE(user.id)}
    className="flex max-w-full items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 transition-colors hover:bg-accent"
  >
    <Avatar className="size-6 shrink-0">
      {user.image && <AvatarImage src={user.image} />}
      <AvatarFallback className="text-[10px]">
        {user.name?.slice(0, 2)}
      </AvatarFallback>
    </Avatar>
    <span className="truncate text-xs font-medium">{user.name}</span>
  </Link>
)

const formatDate = (d: Dayjs) => d.locale("ko").format("M월 D일 (ddd)")

/** 4시간 45분, 2일 3시간 */
function formatDuration(start: Dayjs, end: Dayjs) {
  const total = end.diff(start, "minute")
  const days = Math.floor(total / 1440)
  const hours = Math.floor((total % 1440) / 60)
  const minutes = total % 60
  return [
    days && `${days}일`,
    hours && `${hours}시간`,
    minutes && `${minutes}분`
  ]
    .filter(Boolean)
    .join(" ")
}

/** 아이콘 + 내용 한 줄 */
const DetailRow = ({
  icon: Icon,
  label,
  children
}: {
  icon: typeof Clock
  label: string
  children: React.ReactNode
}) => (
  <div className="flex gap-3">
    <Icon
      size={18}
      className="mt-0.5 shrink-0 text-muted-foreground"
      aria-label={label}
    />
    <div className="min-w-0 flex-1">{children}</div>
  </div>
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
  const contentRef = useRef<HTMLDivElement>(null)

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
  const sameDay = start.isSame(end, "day")
  // '예약자'라고 못 박아 보여 주므로 대신 내세우지 않음 — 예약자 계정이 지워지면 renter는 null
  const renter = rental.renter
  const companions = rental.users.filter((u) => u.id !== renter?.id)
  const dot = getRentalColor(rental.id, true).bg

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-[420px] gap-5 rounded-2xl focus:outline-none"
        ref={contentRef}
        // 첫 버튼(참여자·삭제) 대신 창 자체에 포커스 — 엔터 한 번에 지워지지 않게
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          contentRef.current?.focus()
        }}
      >
        <DialogHeader className="flex-row items-center gap-2.5 space-y-0 pr-6">
          {/* 누른 블록과 같은 색 계열 */}
          <span className={`size-3 shrink-0 rounded-full ${dot}`} />
          <DialogTitle className="text-xl font-semibold">
            {rental.title}
          </DialogTitle>
          {/* 시안에 설명 자리가 없어 화면에는 숨기고 스크린리더에만 전달 */}
          <DialogDescription className="sr-only">
            예약 시간과 예약자 정보입니다. 본인 예약이면 수정·삭제할 수
            있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <DetailRow icon={Clock} label="시간">
            <p className="text-sm font-medium">
              {sameDay
                ? formatDate(start)
                : `${formatDate(start)} – ${formatDate(end)}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {start.format("HH:mm")} – {end.format("HH:mm")} (
              {formatDuration(start, end)})
            </p>
          </DetailRow>

          <DetailRow icon={MapPin} label="장소">
            <p className="text-sm">
              {rental.equipment.brand} {rental.equipment.model}
            </p>
          </DetailRow>

          {(renter || companions.length > 0) && (
            <DetailRow icon={UserRound} label="사람">
              <div className="flex flex-col gap-2">
                {renter && (
                  <div className="flex items-center gap-2">
                    <span className="w-16 shrink-0 text-xs text-muted-foreground">
                      예약자
                    </span>
                    <ParticipantChip user={renter} />
                  </div>
                )}
                {companions.length > 0 && (
                  <div className="flex gap-2">
                    <span className="w-16 shrink-0 pt-1.5 text-xs text-muted-foreground">
                      함께하는 사람
                    </span>
                    <div className="flex min-w-0 flex-wrap gap-1.5">
                      {companions.map((user) => (
                        <ParticipantChip key={user.id} user={user} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DetailRow>
          )}
        </div>
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
