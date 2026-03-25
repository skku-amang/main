"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { useEquipments } from "@/hooks/api/useEquipment"
import { useUsers } from "@/hooks/api/useUser"
import { formatGenerationOrder } from "@/lib/utils"
import {
  CreateRental,
  CreateRentalSchema,
  RentalDetail
} from "@repo/shared-types"

interface RentalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateRental) => void
  editingRental?: RentalDetail | null
  isPending?: boolean
}

function formatDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function RentalFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editingRental,
  isPending = false
}: RentalFormDialogProps) {
  const { data: equipments } = useEquipments()
  const { data: users } = useUsers()
  const isEditing = !!editingRental

  const form = useForm<CreateRental>({
    resolver: zodResolver(CreateRentalSchema),
    defaultValues: {
      title: "",
      equipmentId: undefined,
      startAt: undefined,
      endAt: undefined,
      userIds: []
    }
  })

  useEffect(() => {
    if (open && editingRental) {
      form.reset({
        title: editingRental.title,
        equipmentId: editingRental.equipmentId,
        startAt: editingRental.startAt,
        endAt: editingRental.endAt,
        userIds: editingRental.users.map((u) => u.id)
      })
    } else if (open) {
      form.reset({
        title: "",
        equipmentId: undefined,
        startAt: undefined,
        endAt: undefined,
        userIds: []
      })
    }
  }, [open, editingRental, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "예약 수정" : "예약 생성"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>예약명</FormLabel>
                  <FormControl>
                    <Input placeholder="예약명을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="equipmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>장비</FormLabel>
                  <Select
                    value={field.value?.toString() ?? ""}
                    onValueChange={(v) => field.onChange(parseInt(v))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="장비를 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {equipments?.map((equipment) => (
                        <SelectItem
                          key={equipment.id}
                          value={equipment.id.toString()}
                        >
                          {equipment.brand} {equipment.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>시작 시간</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={
                        field.value instanceof Date
                          ? formatDatetimeLocal(field.value)
                          : (field.value ?? "")
                      }
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? new Date(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>종료 시간</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={
                        field.value instanceof Date
                          ? formatDatetimeLocal(field.value)
                          : (field.value ?? "")
                      }
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? new Date(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>참여자</FormLabel>
                  <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                    {users?.map((user) => (
                      <div key={user.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={field.value?.includes(user.id) ?? false}
                          onCheckedChange={(checked) => {
                            const current = field.value ?? []
                            if (checked) {
                              field.onChange([...current, user.id])
                            } else {
                              field.onChange(
                                current.filter((id) => id !== user.id)
                              )
                            }
                          }}
                        />
                        <label
                          htmlFor={`user-${user.id}`}
                          className="cursor-pointer text-sm"
                        >
                          {user.name} ({user.nickname}){" "}
                          {user.generation?.order !== undefined
                            ? formatGenerationOrder(user.generation.order)
                            : ""}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "저장 중..." : isEditing ? "수정" : "생성"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
