"use client"

import { useCallback, useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter, usePathname } from "next/navigation"
import dayjs, { Dayjs } from "dayjs"
import { Clock, UserRound, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/hooks/use-toast"
import MemberPicker from "@/components/MemberPicker"
import { useAuth } from "@/lib/providers/auth-provider"
import { useCreateRental, useUpdateRental } from "@/hooks/api/useRental"
import { useUsers } from "@/hooks/api/useUser"
import {
  Equipment,
  RentalDetail,
  formatGenerationOrder
} from "@repo/shared-types"
import type { DateRange } from "react-day-picker"

const DEFAULT_TITLE = "개인 연습"

/** "HH:mm" 시각을 그 날짜에 붙임 */
const atTime = (date: Date, time: string) => {
  const [h, m] = time.split(":").map(Number)
  return dayjs(date).hour(h!).minute(m!).second(0)
}

export type RentalFormTarget =
  { mode: "create"; startAt?: Dayjs } | { mode: "edit"; rental: RentalDetail }

/** 예약하기 버튼·빈 칸·상세 창 수정이 같은 폼 하나를 여는 상태 */
export function useRentalForm() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [target, setTarget] = useState<RentalFormTarget | null>(null)

  const open = useCallback(
    (next: RentalFormTarget) => {
      if (!user) {
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
        return
      }
      setTarget(next)
    },
    [user, router, pathname]
  )
  const openCreate = useCallback(
    (startAt?: Dayjs) => {
      // 이미 끝난 칸은 눌러도 열지 않음
      if (startAt && !startAt.add(1, "hour").isAfter(dayjs())) return
      open({ mode: "create", startAt })
    },
    [open]
  )
  const openEdit = useCallback(
    (rental: RentalDetail) => open({ mode: "edit", rental }),
    [open]
  )
  const close = useCallback(() => setTarget(null), [])

  return { target, openCreate, openEdit, close }
}

const toFields = (d: Dayjs) => ({
  date: d.startOf("day").toDate(),
  time: d.format("HH:mm")
})

/** 폼 처음 값 — 빈 칸은 그 시각부터 1시간, 수정은 기존 예약 그대로 */
function getInitialRange(target: RentalFormTarget) {
  if (target.mode === "edit") {
    return {
      start: toFields(dayjs(target.rental.startAt)),
      end: toFields(dayjs(target.rental.endAt))
    }
  }
  if (!target.startAt) return null
  return {
    start: toFields(target.startAt),
    end: toFields(target.startAt.add(1, "hour"))
  }
}

interface RentalFormDialogProps {
  target: RentalFormTarget | null
  onClose: () => void
  equipments: Equipment[]
}

export default function RentalFormDialog({
  target,
  ...props
}: RentalFormDialogProps) {
  if (!target) return null
  return <RentalForm target={target} {...props} />
}

function RentalForm({
  target,
  onClose,
  equipments
}: RentalFormDialogProps & { target: RentalFormTarget }) {
  const editing = target.mode === "edit" ? target.rental : null
  const initialRange = getInitialRange(target)
  const { user } = useAuth()
  const { data: users } = useUsers({ enabled: !!user })
  const createRental = useCreateRental()
  const updateRental = useUpdateRental()
  const isPending = createRental.isPending || updateRental.isPending
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const currentUserId = user?.id ?? null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const disablePastDates = { before: today }

  // Form state
  const [equipmentId, setEquipmentId] = useState<number | null>(
    editing?.equipmentId ??
      (equipments.length === 1 ? (equipments[0]?.id ?? null) : null)
  )

  // equipments prop이 비동기로 로딩될 때 첫 번째 장비를 기본 선택
  useEffect(() => {
    if (equipments.length >= 1 && equipmentId === null) {
      setEquipmentId(equipments[0]?.id ?? null)
    }
  }, [equipments, equipmentId])
  const [title, setTitle] = useState(editing?.title ?? DEFAULT_TITLE)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialRange
      ? { from: initialRange.start.date, to: initialRange.end.date }
      : undefined
  )
  // 끝 날짜를 안 골랐으면 하루짜리
  const startDate = dateRange?.from
  const endDate = dateRange?.to ?? dateRange?.from
  const [startTime, setStartTime] = useState(initialRange?.start.time ?? "")
  const [endTime, setEndTime] = useState(initialRange?.end.time ?? "")
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>(
    editing?.users.map((u) => u.id) ?? (currentUserId ? [currentUserId] : [])
  )

  // session이 비동기로 로딩될 때 본인 ID를 참여자에 동기화 — 수정 땐 참여자를 다 빼도 다시 넣지 않음
  useEffect(() => {
    if (!editing && currentUserId && selectedUserIds.length === 0) {
      setSelectedUserIds([currentUserId])
    }
  }, [editing, currentUserId, selectedUserIds.length])

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!equipmentId) newErrors.equipmentId = "장비를 선택해주세요."
    if (!startDate) newErrors.startDate = "날짜를 선택해주세요."
    if (!startTime) newErrors.startTime = "시작 시간을 선택해주세요."
    if (!endTime) newErrors.endTime = "종료 시간을 선택해주세요."
    if (selectedUserIds.length === 0)
      newErrors.users = "참여자를 최소 1명 선택해주세요."

    if (startDate && endDate && startTime && endTime) {
      const start = atTime(startDate, startTime)
      const end = atTime(endDate, endTime)
      if (!end.isAfter(start)) {
        newErrors.endTime = "종료 시간은 시작 시간보다 뒤여야 합니다."
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate() || !equipmentId || !startDate || !endDate) return

    const startAt = atTime(startDate, startTime).toDate()
    const endAt = atTime(endDate, endTime).toDate()

    const fields = {
      title: title.trim() || DEFAULT_TITLE,
      startAt,
      endAt,
      userIds: selectedUserIds
    }
    const callbacks = {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["rentals"] })
        onClose()
        if (editing) toast({ title: "예약을 수정했어요." })
      },
      onError: (error: { detail?: string; message: string }) => {
        toast({
          variant: "destructive",
          title: editing ? "수정 실패" : "예약 실패",
          description: error.detail ?? error.message
        })
      }
    }

    if (editing) updateRental.mutate([editing.id, fields], callbacks)
    else createRental.mutate([{ equipmentId, ...fields }], callbacks)
  }

  const addUser = (id: number) => {
    if (!selectedUserIds.includes(id)) {
      setSelectedUserIds((prev) => [...prev, id])
    }
  }

  const removeUser = (userId: number) => {
    setSelectedUserIds((prev) => prev.filter((id) => id !== userId))
  }

  const selectedUsers =
    users?.filter((u) => selectedUserIds.includes(u.id)) ?? []

  return (
    // 저장 중에 닫으면 폼이 사라져 mutate 콜백(달력 갱신·실패 안내)이 실행되지 않음
    <Dialog open onOpenChange={(v) => !v && !isPending && onClose()}>
      <DialogContent
        className="max-h-[90vh] w-fit overflow-y-auto rounded-2xl"
        // 입력 폼 — 바깥을 잘못 눌러 입력이 사라지지 않게. 닫기는 [취소]·Esc로 (✕는 [취소]와 중복)
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* 화면엔 숨기고 화면 낭독기에만 전달 */}
        <DialogHeader className="sr-only">
          <DialogTitle>{editing ? "예약 수정" : "예약 추가"}</DialogTitle>
          <DialogDescription>예약 정보를 입력해주세요</DialogDescription>
        </DialogHeader>

        {/* 가장 넓은 고정 요소(달력) 폭에 맞춤 — 칩 등은 그 안에서 줄바꿈 */}
        <div className="w-min space-y-5">
          {/* 장비 선택 (여러 장비일 때만 표시, 수정 땐 장비 그대로) */}
          {!editing && equipments.length > 1 && (
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">장비</p>
              <Select
                onValueChange={(v) => setEquipmentId(Number(v))}
                value={equipmentId?.toString()}
              >
                <SelectTrigger aria-label="장비">
                  <SelectValue placeholder="장비를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {equipments.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id.toString()}>
                      {eq.brand} {eq.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.equipmentId && (
                <p className="text-sm text-destructive">{errors.equipmentId}</p>
              )}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label
              htmlFor="rentalTitle"
              className="text-sm font-medium text-muted-foreground"
            >
              Title
            </label>
            <Input
              id="rentalTitle"
              name="title"
              placeholder={DEFAULT_TITLE}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Date & Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock size={14} />
              <span>Date & Time</span>
            </div>

            <div className="space-y-1.5">
              <Calendar
                mode="range"
                // 범위를 다 고른 뒤 다시 누르면 새로 시작 — 하루짜리 예약 날짜를 옮길 때 범위가 늘어나지 않게
                resetOnSelect
                selected={dateRange}
                onSelect={setDateRange}
                disabled={disablePastDates}
                className="mx-auto rounded-md border [--cell-size:2.5rem]"
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="time"
                aria-label="시작 시각"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <span className="text-muted-foreground text-sm">~</span>
              <Input
                type="time"
                aria-label="종료 시각"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <div>
              {errors.startTime && (
                <p className="text-sm text-destructive">{errors.startTime}</p>
              )}
              {errors.endTime && (
                <p className="text-sm text-destructive">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Separator */}
          <div className="border-t" />

          {/* Add participants */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <UserRound size={14} />
              <span>Add participants</span>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Members</p>
              <MemberPicker
                users={users ?? []}
                excludeIds={selectedUserIds}
                onSelect={(user) => addUser(user.id)}
              />
            </div>

            {/* Selected members as avatar chips */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-1.5 rounded-full border bg-background px-2 py-1"
                  >
                    <Avatar className="h-6 w-6">
                      {user.image && <AvatarImage src={user.image} />}
                      <AvatarFallback className="text-[10px]">
                        {user.name?.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[80px] truncate text-xs">
                      {user.name}
                    </span>
                    {user.generation && (
                      <span className="text-[10px] text-muted-foreground">
                        {formatGenerationOrder(user.generation.order)}기
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeUser(user.id)}
                      aria-label={`${user.name} 빼기`}
                      className="flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.users && (
              <p className="text-sm text-destructive">{errors.users}</p>
            )}
          </div>

          {/* Separator */}
          <div className="border-t" />

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              취소
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
