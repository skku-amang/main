"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter, usePathname } from "next/navigation"
import dayjs from "dayjs"
import { Clock, PlusCircle, UserRound, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
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
import { cn } from "@/lib/utils"
import { useCreateRental } from "@/hooks/api/useRental"
import { useUsers } from "@/hooks/api/useUser"
import { Equipment } from "@repo/shared-types"
import type { DateRange } from "react-day-picker"

// Generate hour/minute options
const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0")
)
const MINUTES = Array.from({ length: 4 }, (_, i) =>
  (i * 15).toString().padStart(2, "0")
)

interface AddScheduleButtonProps {
  className?: string
  equipments: Equipment[]
  iconOnly?: boolean
  label?: string
}

export default function AddScheduleButton({
  className,
  equipments,
  iconOnly,
  label
}: AddScheduleButtonProps) {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const { data: users } = useUsers()
  const createRental = useCreateRental()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()

  const currentUserId = session?.user?.id ? Number(session.user.id) : null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const disablePastDates = { before: today }

  // Form state
  const [equipmentId, setEquipmentId] = useState<number | null>(
    equipments.length === 1 ? (equipments[0]?.id ?? null) : null
  )

  // equipments prop이 비동기로 로딩될 때 equipmentId를 동기화
  // 모바일에서 장비 셀렉터가 숨겨지므로 첫 번째 장비를 자동 선택
  useEffect(() => {
    if (equipments.length >= 1 && equipmentId === null) {
      setEquipmentId(equipments[0]?.id ?? null)
    }
  }, [equipments, equipmentId])
  const [title, setTitle] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [startHour, setStartHour] = useState("")
  const [startMinute, setStartMinute] = useState("")
  const [endHour, setEndHour] = useState("")
  const [endMinute, setEndMinute] = useState("")
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>(
    currentUserId ? [currentUserId] : []
  )

  // session이 비동기로 로딩될 때 본인 ID를 참여자에 동기화
  useEffect(() => {
    if (currentUserId && selectedUserIds.length === 0) {
      setSelectedUserIds([currentUserId])
    }
  }, [currentUserId, selectedUserIds.length])

  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setEquipmentId(equipments.length === 1 ? (equipments[0]?.id ?? null) : null)
    setTitle("")
    setStartDate(undefined)
    setEndDate(undefined)
    setStartHour("")
    setStartMinute("")
    setEndHour("")
    setEndMinute("")
    setSelectedUserIds(currentUserId ? [currentUserId] : [])
    setErrors({})
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!equipmentId) newErrors.equipmentId = "장비를 선택해주세요."
    if (!title.trim()) newErrors.title = "예약 제목은 필수입니다."
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

    createRental.mutate(
      [
        {
          equipmentId,
          title,
          startAt,
          endAt,
          userIds: selectedUserIds
        }
      ],
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["rentals"] })
          setOpen(false)
          resetForm()
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "예약 실패",
            description:
              error instanceof Error
                ? error.message
                : "예약을 추가하지 못했습니다."
          })
        }
      }
    )
  }

  const handleCancel = () => {
    setOpen(false)
    resetForm()
  }

  const addUser = (userId: string) => {
    const id = Number(userId)
    if (!selectedUserIds.includes(id)) {
      setSelectedUserIds((prev) => [...prev, id])
    }
  }

  const removeUser = (userId: number) => {
    setSelectedUserIds((prev) => prev.filter((id) => id !== userId))
  }

  const selectedUsers =
    users?.filter((u) => selectedUserIds.includes(u.id)) ?? []
  const availableUsers =
    users?.filter((u) => !selectedUserIds.includes(u.id)) ?? []

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v && !session) {
          router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
          return
        }
        setOpen(v)
        if (!v) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button
          className={cn(
            iconOnly
              ? "h-14 w-14 rounded-full p-0 bg-primary text-gray-50"
              : label
                ? "text-white text-base font-semibold bg-third h-[45px] rounded-[10px]"
                : "text-gray-50 text-sm font-medium bg-primary w-36 h-9",
            className
          )}
        >
          {iconOnly ? (
            <PlusCircle size={24} />
          ) : (
            <div className="flex gap-2 justify-center items-center">
              <PlusCircle size={18} />
              {label ?? "Add schedule"}
            </div>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add schedule</DialogTitle>
          <DialogDescription>예약 정보를 입력해주세요</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* 장비 선택 (데스크톱 + 여러 장비일 때만 표시) */}
          {equipments.length > 1 && (
            <div className="hidden sm:block space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                장비
              </label>
              <Select
                onValueChange={(v) => setEquipmentId(Number(v))}
                value={equipmentId?.toString()}
              >
                <SelectTrigger>
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
            <label className="text-sm font-medium text-muted-foreground">
              Title
            </label>
            <Input
              placeholder="Input Text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
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
                <label className="text-sm text-muted-foreground">
                  Start date
                </label>
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
                <label className="text-sm text-muted-foreground">
                  End date
                </label>
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
                <label className="text-sm text-muted-foreground">From</label>
                <div className="flex items-center gap-1">
                  <Select value={startHour} onValueChange={setStartHour}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground">:</span>
                  <Select value={startMinute} onValueChange={setStartMinute}>
                    <SelectTrigger className="w-full">
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
                <label className="text-sm text-muted-foreground">To</label>
                <div className="flex items-center gap-1">
                  <Select value={endHour} onValueChange={setEndHour}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground">:</span>
                  <Select value={endMinute} onValueChange={setEndMinute}>
                    <SelectTrigger className="w-full">
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
                <Select value={startHour} onValueChange={setStartHour}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="HH" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">:</span>
                <Select value={startMinute} onValueChange={setStartMinute}>
                  <SelectTrigger className="h-9">
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
                <Select value={endHour} onValueChange={setEndHour}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="HH" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">:</span>
                <Select value={endMinute} onValueChange={setEndMinute}>
                  <SelectTrigger className="h-9">
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
          <div className="border-t sm:block hidden" />

          {/* Add participants (desktop only — mobile defaults to current user) */}
          <div className="hidden sm:block space-y-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <UserRound size={14} />
              <span>Add participants</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Members</label>
              <Select onValueChange={addUser} value={undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    <span className="max-w-[60px] truncate text-xs">
                      {user.name}
                    </span>
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
              onClick={handleCancel}
            >
              취소
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleSubmit}
              disabled={createRental.isPending}
            >
              {createRental.isPending ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
