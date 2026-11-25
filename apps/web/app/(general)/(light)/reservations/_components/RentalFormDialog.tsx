"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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
import {
  useCreateRental,
  useRentals,
  useUpdateRental
} from "@/hooks/api/useRental"
import { useUsers } from "@/hooks/api/useUser"
import {
  Equipment,
  EditPhase,
  RentalDetail,
  SlotSelection,
  TimeRange,
  buildDaySlots,
  busyFlags,
  endOnlyTappable,
  formatDuration,
  formatGenerationOrder,
  moveRangeToDate,
  nextFullHour,
  rangeOverlapsBusy,
  rentalEditPhase,
  selectSlot,
  selectionFromRange,
  selectionRange,
  slotQueryRange,
  tappableSlots
} from "@repo/shared-types"
import TimeSlotPicker from "./TimeSlotPicker"

const DEFAULT_TITLE = "개인 연습"

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

/** 폼 처음 값 — 빈 칸은 그 시각부터 1시간, 예약하기 버튼은 다음 정시부터 1시간, 수정은 기존 예약 그대로 */
function getInitialRange(target: RentalFormTarget): TimeRange {
  if (target.mode === "edit") {
    return { startAt: target.rental.startAt, endAt: target.rental.endAt }
  }
  const startAt = target.startAt ?? dayjs(nextFullHour(new Date()))
  return { startAt: startAt.toDate(), endAt: startAt.add(1, "hour").toDate() }
}

const startOfDay = (d: Date) => dayjs(d).startOf("day").toDate()

/** "21:00 ~ 23:00 (2시간)", 끝이 다음날이면 "23:00 ~ 다음날 01:00 (2시간)" */
function formatRange({ startAt, endAt }: TimeRange) {
  const start = dayjs(startAt)
  const end = dayjs(endAt)
  const endLabel = `${end.isSame(start, "day") ? "" : "다음날 "}${end.format("HH:mm")}`
  const duration = formatDuration(0, end.diff(start, "minute"))
  return `${start.format("HH:mm")} ~ ${endLabel}${duration ? ` (${duration})` : ""}`
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
  // 폼을 연 순간 기준 — 열어 둔 사이에 시각이 바뀌어도 동작은 그대로, 저장은 서버가 판단
  const [openedAt] = useState(() => new Date())
  const [initialRange] = useState(() => getInitialRange(target))
  const phase: EditPhase | "create" = editing
    ? rentalEditPhase(initialRange, openedAt)
    : "create"
  const { user } = useAuth()
  const { data: users } = useUsers({ enabled: !!user })
  const createRental = useCreateRental()
  const updateRental = useUpdateRental()
  const isPending = createRental.isPending || updateRental.isPending
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const currentUserId = user?.id ?? null
  const disablePastDates = { before: startOfDay(openedAt) }

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
  const [date, setDate] = useState(() => startOfDay(initialRange.startAt))
  const slots = useMemo(() => buildDaySlots(date), [date])
  // 칸으로 고른 값. 30분 단위가 아닌 기존 예약은 칸 대신 keptRange로 원래 시각을 지닌다
  const [selection, setSelection] = useState<SlotSelection>(() =>
    phase === "create" || phase === "upcoming"
      ? selectionFromRange(initialRange, slots)
      : null
  )
  const [keptRange, setKeptRange] = useState<TimeRange | null>(() =>
    phase === "upcoming" && !selectionFromRange(initialRange, slots)
      ? initialRange
      : null
  )
  // 진행 중인 예약 수정은 시작을 고정하고 끝 칸만 고른다
  const [endIndex, setEndIndex] = useState<number | null>(null)

  const {
    data: dayRentals,
    isLoading: busyLoading,
    isError: busyError
  } = useRentals(
    { equipmentId: equipmentId ?? undefined, ...slotQueryRange(date) },
    { enabled: !!equipmentId && phase !== "ended" }
  )
  const busyRanges = useMemo(
    () =>
      (dayRentals ?? []).map((r) => ({
        id: r.id,
        startAt: r.startAt,
        endAt: r.endAt
      })),
    [dayRentals]
  )
  // 현황을 못 불러오면 남은 옛 값도 버리고 칸을 다 열어 둔다 — 겹치면 저장할 때 서버가 거절함
  const liveBusyRanges = busyError ? [] : busyRanges
  const busy = busyFlags(slots, liveBusyRanges, editing?.id)
  const slotContext = { slots, busy, now: openedAt }

  // 날짜·장비를 바꿔 고른 시간이 남의 예약과 겹치게 되면 선택을 비운다
  const overlaps = (r: TimeRange) =>
    rangeOverlapsBusy(r, liveBusyRanges, editing?.id)
  const liveSelection =
    selection && !overlaps(selectionRange(selection, slots)) ? selection : null
  const liveKept = keptRange && !overlaps(keptRange) ? keptRange : null

  const range: TimeRange | null =
    phase === "ended"
      ? initialRange
      : phase === "ongoing"
        ? {
            startAt: initialRange.startAt,
            endAt:
              endIndex === null ? initialRange.endAt : slots[endIndex]!.endAt
          }
        : liveSelection
          ? selectionRange(liveSelection, slots)
          : liveKept

  const tappable =
    phase === "ongoing"
      ? endOnlyTappable(
          initialRange.startAt,
          slots,
          openedAt,
          liveBusyRanges,
          editing?.id
        )
      : tappableSlots(liveSelection, slotContext)
  const selected = slots.map((slot, i) =>
    phase === "ongoing"
      ? !!range && slot.endAt > range.startAt && slot.startAt < range.endAt
      : !!liveSelection && i >= liveSelection.start && i <= liveSelection.end
  )
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
  const clearTimeError = () =>
    setErrors((prev) => {
      if (!prev.time) return prev
      const next = { ...prev }
      delete next.time
      return next
    })
  const tapSlot = (index: number) => {
    if (phase === "ongoing") setEndIndex(index)
    else {
      setSelection(selectSlot(liveSelection, index, slotContext))
      setKeptRange(null)
    }
    clearTimeError()
  }
  // 고른 시각·길이를 유지한 채 날짜만 옮긴다. 옮긴 시작이 이미 지났으면 비운다
  const changeDate = (next: Date | undefined) => {
    if (!next) return
    setDate(next)
    const current = liveSelection
      ? selectionRange(liveSelection, slots)
      : liveKept
    const moved = current && moveRangeToDate(current, next)
    if (!moved || moved.startAt < openedAt) {
      setSelection(null)
      setKeptRange(null)
      return
    }
    const nextSelection = selectionFromRange(moved, buildDaySlots(next))
    setSelection(nextSelection)
    setKeptRange(nextSelection ? null : moved)
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!equipmentId) newErrors.equipmentId = "장비를 선택해주세요."
    if (!range) newErrors.time = "시간을 골라주세요."
    if (selectedUserIds.length === 0)
      newErrors.users = "참여자를 최소 1명 선택해주세요."

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate() || !equipmentId || !range) return

    const fields = {
      title: title.trim() || DEFAULT_TITLE,
      startAt: range.startAt,
      endAt: range.endAt,
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
        className="max-h-[90vh] w-fit overflow-y-auto"
        // 입력 폼 — 바깥을 잘못 눌러 입력이 사라지지 않게. 닫기는 [취소]·Esc로 (✕는 [취소]와 중복)
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* 화면엔 숨기고 화면 낭독기에만 전달 */}
        <DialogHeader className="sr-only">
          <DialogTitle>{editing ? "예약 수정" : "예약 추가"}</DialogTitle>
          <DialogDescription>예약 정보를 입력해주세요</DialogDescription>
        </DialogHeader>

        {/* 가장 넓은 고정 요소(달력) 폭에 맞춤 — 칩 등은 그 안에서 줄바꿈.
            진행 중·끝난 예약 수정은 달력을 숨기므로 달력 폭(306px)을 최소 폭으로 둔다 */}
        <div className="w-min min-w-[19.125rem] space-y-5">
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

            {phase === "ended" ? (
              <p className="text-sm">
                {dayjs(initialRange.startAt).locale("ko").format("M월 D일")}{" "}
                {formatRange(initialRange)}
              </p>
            ) : (
              <>
                {phase !== "ongoing" && (
                  <Calendar
                    mode="single"
                    required
                    selected={date}
                    onSelect={changeDate}
                    disabled={disablePastDates}
                    className="mx-auto rounded-md border [--cell-size:2.5rem]"
                  />
                )}
                {/* 칸으로 못 나타내는 원래 시각은 칸 위에 따로 보여 준다 */}
                {liveKept && !liveSelection && (
                  <p className="text-sm text-muted-foreground">
                    지금 {formatRange(liveKept)}
                  </p>
                )}
                <TimeSlotPicker
                  slots={slots}
                  busy={busy}
                  tappable={tappable}
                  selected={selected}
                  onTap={tapSlot}
                  loading={busyLoading}
                />
                {busyError && (
                  <p className="text-sm text-destructive">
                    예약 현황을 못 불러왔어요
                  </p>
                )}
              </>
            )}
            {errors.time && (
              <p className="text-sm text-destructive">{errors.time}</p>
            )}
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
              // 현황을 받기 전엔 처음 골라 둔 시간이 남의 예약과 겹치는지 모른다
              disabled={isPending || busyLoading}
            >
              {isPending ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
