"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSession } from "next-auth/react"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
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
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { PlusCircle } from "lucide-react"
import { useCreateRental } from "@/hooks/api/useRental"
import { useUsers } from "@/hooks/api/useUser"
import { Equipment } from "@repo/shared-types"

const formSchema = z
  .object({
    equipmentId: z.number({ required_error: "장비를 선택해주세요." }),
    title: z.string().min(1, "예약 제목은 필수입니다."),
    startAt: z.string().min(1, "시작 시간을 선택해주세요."),
    endAt: z.string().min(1, "종료 시간을 선택해주세요."),
    userIds: z.array(z.number()).min(1, "참여자를 최소 1명 선택해주세요.")
  })
  .refine((data) => new Date(data.startAt) < new Date(data.endAt), {
    message: "종료 시간은 시작 시간보다 뒤여야 합니다.",
    path: ["endAt"]
  })

type FormValues = z.infer<typeof formSchema>

interface AddScheduleButtonProps {
  className?: string
  equipments: Equipment[]
}

export default function AddScheduleButton({
  className,
  equipments
}: AddScheduleButtonProps) {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const { data: users } = useUsers()
  const createRental = useCreateRental()
  const queryClient = useQueryClient()

  const currentUserId = session?.user?.id ? Number(session.user.id) : null

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      startAt: "",
      endAt: "",
      userIds: currentUserId ? [currentUserId] : []
    }
  })

  const onSubmit = async (values: FormValues) => {
    createRental.mutate(
      [
        {
          equipmentId: values.equipmentId,
          title: values.title,
          startAt: new Date(values.startAt),
          endAt: new Date(values.endAt),
          userIds: values.userIds
        }
      ],
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["rentals"] })
          setOpen(false)
          form.reset()
        }
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "text-gray-50 w-36 h-9 text-sm font-medium bg-primary",
            className
          )}
        >
          <div className="flex gap-2 justify-center items-center">
            <PlusCircle size={18} />
            Add Schedule
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>예약 추가</DialogTitle>
          <DialogDescription>동아리방 예약을 추가합니다.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 장비 선택 */}
            <FormField
              control={form.control}
              name="equipmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>장소</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="장소를 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {equipments.map((eq) => (
                        <SelectItem key={eq.id} value={eq.id.toString()}>
                          {eq.brand} {eq.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 제목 */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>예약 제목</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 밤편지 합주" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 시작 시간 */}
            <FormField
              control={form.control}
              name="startAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>시작 시간</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 종료 시간 */}
            <FormField
              control={form.control}
              name="endAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>종료 시간</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 참여자 */}
            <FormField
              control={form.control}
              name="userIds"
              render={() => (
                <FormItem>
                  <FormLabel>참여자</FormLabel>
                  <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
                    {users?.map((user) => (
                      <FormField
                        key={user.id}
                        control={form.control}
                        name="userIds"
                        render={({ field }) => (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={field.value?.includes(user.id)}
                              onCheckedChange={(checked) => {
                                const current = field.value ?? []
                                field.onChange(
                                  checked
                                    ? [...current, user.id]
                                    : current.filter((id) => id !== user.id)
                                )
                              }}
                            />
                            <span className="text-sm">{user.name}</span>
                          </div>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={createRental.isPending}
            >
              {createRental.isPending ? "예약 중..." : "예약 추가"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
