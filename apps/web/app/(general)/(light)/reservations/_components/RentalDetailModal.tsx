"use client"

import "dayjs/locale/ko"

import { useRef, useState } from "react"
import dayjs, { Dayjs } from "dayjs"
import { Clock, Package, Pencil, Trash2, UserRound, Users } from "lucide-react"
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

/** 아이콘(18px) 위치 — 첫 글자 줄(20px)·첫 칩 줄(34px) 가운데, 또는 내용 전체 가운데 */
const ICON_ALIGN = {
  text: "mt-px",
  chip: "mt-2",
  center: "self-center"
} as const

/** 아이콘 + 내용 한 줄 */
const DetailRow = ({
  icon: Icon,
  label,
  align = "text",
  children
}: {
  icon: typeof Clock
  label: string
  align?: keyof typeof ICON_ALIGN
  children: React.ReactNode
}) => (
  <div className="flex gap-3">
    <Icon
      size={18}
      className={`${ICON_ALIGN[align]} shrink-0 text-muted-foreground`}
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
  const attendees = rental.users.filter((u) => u.id !== renter?.id)
  const dot = getRentalColor(rental.id, true).bg

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-[420px] gap-5 focus:outline-none"
        // 바깥을 누르거나 Esc로 닫힘
        showCloseButton={false}
        ref={contentRef}
        // 첫 버튼(참여자·삭제) 대신 창 자체에 포커스 — 엔터 한 번에 지워지지 않게
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          contentRef.current?.focus()
        }}
      >
        <DialogHeader className="flex-row items-center gap-2.5 space-y-0 text-left">
          {/* 누른 블록과 같은 색 계열 */}
          <span className={`size-3 shrink-0 rounded-full ${dot}`} />
          <DialogTitle className="min-w-0 flex-1 text-xl font-semibold">
            {rental.title}
          </DialogTitle>
          {canManage && (
            <div className="-my-1 -mr-2 flex shrink-0">
              <Button
                variant="ghost"
                className="size-8 p-0 text-muted-foreground"
                aria-label="수정"
                title="수정"
                onClick={() => onEdit(rental)}
              >
                <Pencil size={16} />
              </Button>
              <Button
                variant="ghost"
                className="size-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="삭제"
                title="삭제"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleteRental.isPending}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          )}
          {/* 시안에 설명 자리가 없어 화면에는 숨기고 스크린리더에만 전달 */}
          <DialogDescription className="sr-only">
            예약 시간과 예약자 정보입니다. 본인 예약이면 수정·삭제할 수
            있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <DetailRow icon={Clock} label="시간" align="center">
            {sameDay ? (
              <>
                <p className="text-sm font-medium">{formatDate(start)}</p>
                <p className="text-sm text-muted-foreground">
                  {start.format("HH:mm")} – {end.format("HH:mm")} (
                  {formatDuration(start, end)})
                </p>
              </>
            ) : (
              // 여러 날이면 날짜와 시각을 짝지어 — '20:00 – 10:00'이 거꾸로 읽히지 않게.
              // 좁으면 날짜 중간이 아니라 '–' 자리에서 줄바꿈
              <>
                <p className="text-sm font-medium">
                  <span className="whitespace-nowrap">
                    {formatDate(start)} {start.format("HH:mm")}
                  </span>{" "}
                  –{" "}
                  <span className="whitespace-nowrap">
                    {formatDate(end)} {end.format("HH:mm")}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDuration(start, end)}
                </p>
              </>
            )}
          </DetailRow>

          {/* 동방 예약은 장소가 자명해서 장비 대여만 — 어떤 장비인지 */}
          {rental.equipment.category !== "ROOM" && (
            <DetailRow icon={Package} label="장비">
              <p className="text-sm">
                {rental.equipment.brand} {rental.equipment.model}
              </p>
            </DetailRow>
          )}

          {renter && (
            <DetailRow icon={UserRound} label="예약자" align="chip">
              <div className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-xs text-muted-foreground">
                  예약자
                </span>
                <ParticipantChip user={renter} />
              </div>
            </DetailRow>
          )}

          {attendees.length > 0 && (
            <DetailRow icon={Users} label="참석자" align="chip">
              <div className="flex gap-2">
                {/* 칩이 여러 줄이어도 첫 칩 줄(34px) 가운데에 */}
                <span className="flex h-[34px] w-12 shrink-0 items-center text-xs text-muted-foreground">
                  참석자
                </span>
                <div className="flex min-w-0 flex-wrap gap-1.5">
                  {attendees.map((user) => (
                    <ParticipantChip key={user.id} user={user} />
                  ))}
                </div>
              </div>
            </DetailRow>
          )}
        </div>
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
