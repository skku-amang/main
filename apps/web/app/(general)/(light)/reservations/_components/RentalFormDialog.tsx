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

// Generate hour/minute options
const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0")
)
const MINUTES = Array.from({ length: 4 }, (_, i) =>
  (i * 15).toString().padStart(2, "0")
)

const DEFAULT_TITLE = "개인 연습"

// 동방 사용은 대부분 9~23시 (22~06시 합주 금지)
const FIRST_USABLE_HOUR = 9
const LAST_USABLE_HOUR = 22

/** 아직 고르지 않은 시간 목록을 열 때 먼저 보여줄 시 */
function getInitialHour(afterHour?: string): number {
  if (afterHour) return Math.min(Number(afterHour) + 1, 23)
  const now = dayjs().hour()
  return now >= FIRST_USABLE_HOUR && now <= LAST_USABLE_HOUR
    ? now
    : FIRST_USABLE_HOUR
}

interface HourSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  triggerClassName?: string
  ariaLabel: string
  /** 종료 시간 선택 시 시작 시간 — 목록이 그 다음 시부터 보임 */
  afterHour?: string
}

function HourSelect({
  value,
  onValueChange,
  placeholder,
  triggerClassName,
  ariaLabel,
  afterHour
}: HourSelectProps) {
  const initialHour = getInitialHour(afterHour).toString().padStart(2, "0")
  // 열릴 때 Radix가 첫 항목(00)에 포커스를 주므로 그 다음 프레임에 옮김
  const moveToInitialHour = useCallback((el: HTMLDivElement | null) => {
    if (!el) return
    requestAnimationFrame(() => {
      el.focus({ preventScroll: true })
      el.scrollIntoView({ block: "start" })
    })
  }, [])

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={triggerClassName} aria-label={ariaLabel}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {HOURS.map((h) => (
          <SelectItem
            key={h}
            value={h}
            ref={!value && h === initialHour ? moveToInitialHour : undefined}
          >
            {h}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
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
  hour: d.format("HH"),
  minute: d.format("mm")
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

  // equipments prop이 비동기로 로딩될 때 equipmentId를 동기화
  // 모바일에서 장비 셀렉터가 숨겨지므로 첫 번째 장비를 자동 선택
  useEffect(() => {
    if (equipments.length >= 1 && equipmentId === null) {
      setEquipmentId(equipments[0]?.id ?? null)
    }
  }, [equipments, equipmentId])
  const [title, setTitle] = useState(editing?.title ?? "")
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialRange?.start.date
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialRange?.end.date
  )
  const [startHour, setStartHour] = useState(initialRange?.start.hour ?? "")
  const [startMinute, setStartMinute] = useState(
    initialRange?.start.minute ?? ""
  )
  const [endHour, setEndHour] = useState(initialRange?.end.hour ?? "")
  const [endMinute, setEndMinute] = useState(initialRange?.end.minute ?? "")
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>(
    editing?.users.map((u) => u.id) ?? (currentUserId ? [currentUserId] : [])
  )

  // session이 비동기로 로딩될 때 본인 ID를 참여자에 동기화
  useEffect(() => {
    if (currentUserId && selectedUserIds.length === 0) {
      setSelectedUserIds([currentUserId])
    }
  }, [currentUserId, selectedUserIds.length])

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!equipmentId) newErrors.equipmentId = "장비를 선택해주세요."
    if (!startDate) newErrors.startDate = "시작 날짜를 선택해주세요."
    if (!endDate) newErrors.endDate = "종료 날짜를 선택해주세요."
    if (!startHour || !startMinute)
      newErrors.startTime = "시작 시간을 선택해주세요."
    if (!endHour || !endMinute) newErrors.endTime = "종료 시간을 선택해주세요."
    if (selectedUserIds.length === 0)
      newErrors.users = "참여자를 최소 1명 선택해주세요."

    if (
      startDate &&
      endDate &&
      startHour &&
      startMinute &&
      endHour &&
      endMinute
    ) {
      const start = dayjs(startDate)
        .hour(Number(startHour))
        .minute(Number(startMinute))
      const end = dayjs(endDate).hour(Number(endHour)).minute(Number(endMinute))
      if (!end.isAfter(start)) {
        newErrors.endTime = "종료 시간은 시작 시간보다 뒤여야 합니다."
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate() || !equipmentId || !startDate || !endDate) return

    const startAt = dayjs(startDate)
      .hour(Number(startHour))
      .minute(Number(startMinute))
      .second(0)
      .toDate()
    const endAt = dayjs(endDate)
      .hour(Number(endHour))
      .minute(Number(endMinute))
      .second(0)
      .toDate()

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
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {editing ? "예약 수정" : "예약 추가"}
          </DialogTitle>
          <DialogDescription>예약 정보를 입력해주세요</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* 장비 선택 (데스크톱 + 여러 장비일 때만 표시, 수정 땐 장비 그대로) */}
          {!editing && equipments.length > 1 && (
            <div className="hidden sm:block space-y-1.5">
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

            {/* Desktop: two calendars side by side */}
            <div className="hidden sm:flex gap-3">
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="text-sm text-muted-foreground">Start date</p>
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date)
                    // 종료일이 비어있거나 시작일보다 이전이면 자동으로 시작일과 동일하게 맞춤
                    if (date && (!endDate || endDate < date)) {
                      setEndDate(date)
                    }
                  }}
                  disabled={disablePastDates}
                  className="rounded-md border p-1"
                  classNames={{
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 flex items-center justify-center text-sm rounded-md aria-selected:bg-primary aria-selected:text-primary-foreground"
                  }}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate}</p>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="text-sm text-muted-foreground">End date</p>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={disablePastDates}
                  className="rounded-md border p-1"
                  classNames={{
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 flex items-center justify-center text-sm rounded-md aria-selected:bg-primary aria-selected:text-primary-foreground"
                  }}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Mobile: range calendar */}
            <div className="sm:hidden space-y-1.5">
              <Calendar
                mode="range"
                selected={
                  startDate || endDate
                    ? { from: startDate, to: endDate }
                    : undefined
                }
                onSelect={(range: DateRange | undefined) => {
                  setStartDate(range?.from)
                  setEndDate(range?.to ?? range?.from)
                }}
                disabled={disablePastDates}
                className="rounded-md border p-1 w-full"
                classNames={{
                  head_row: "flex w-full",
                  head_cell:
                    "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "flex-1 h-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-9 w-full p-0 font-normal aria-selected:opacity-100 flex items-center justify-center text-sm rounded-md"
                }}
              />
              {(errors.startDate || errors.endDate) && (
                <p className="text-sm text-destructive">
                  {errors.startDate || errors.endDate}
                </p>
              )}
            </div>

            {/* Desktop: time selectors */}
            <div className="hidden sm:flex gap-3">
              <div className="flex-1 space-y-1.5">
                <p className="text-sm text-muted-foreground">From</p>
                <div className="flex items-center gap-1">
                  <HourSelect
                    value={startHour}
                    onValueChange={setStartHour}
                    placeholder="Select"
                    triggerClassName="w-full"
                    ariaLabel="시작 시각(시)"
                  />
                  <span className="text-muted-foreground">:</span>
                  <Select value={startMinute} onValueChange={setStartMinute}>
                    <SelectTrigger
                      className="w-full"
                      aria-label="시작 시각(분)"
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {MINUTES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.startTime && (
                  <p className="text-sm text-destructive">{errors.startTime}</p>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <p className="text-sm text-muted-foreground">To</p>
                <div className="flex items-center gap-1">
                  <HourSelect
                    value={endHour}
                    onValueChange={setEndHour}
                    placeholder="Select"
                    triggerClassName="w-full"
                    ariaLabel="종료 시각(시)"
                    afterHour={startHour}
                  />
                  <span className="text-muted-foreground">:</span>
                  <Select value={endMinute} onValueChange={setEndMinute}>
                    <SelectTrigger
                      className="w-full"
                      aria-label="종료 시각(분)"
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {MINUTES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.endTime && (
                  <p className="text-sm text-destructive">{errors.endTime}</p>
                )}
              </div>
            </div>

            {/* Mobile: compact time row */}
            <div className="flex sm:hidden items-center gap-2">
              <div className="flex flex-1 items-center gap-1">
                <HourSelect
                  value={startHour}
                  onValueChange={setStartHour}
                  placeholder="HH"
                  triggerClassName="h-9"
                  ariaLabel="시작 시각(시)"
                />
                <span className="text-muted-foreground">:</span>
                <Select value={startMinute} onValueChange={setStartMinute}>
                  <SelectTrigger className="h-9" aria-label="시작 시각(분)">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {MINUTES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="text-muted-foreground text-sm">~</span>
              <div className="flex flex-1 items-center gap-1">
                <HourSelect
                  value={endHour}
                  onValueChange={setEndHour}
                  placeholder="HH"
                  triggerClassName="h-9"
                  ariaLabel="종료 시각(시)"
                  afterHour={startHour}
                />
                <span className="text-muted-foreground">:</span>
                <Select value={endMinute} onValueChange={setEndMinute}>
                  <SelectTrigger className="h-9" aria-label="종료 시각(분)">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {MINUTES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Mobile time errors */}
            <div className="sm:hidden">
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
