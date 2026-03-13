"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useSessions } from "@/hooks/api/useSession"
import { getSessionDisplayName } from "@/constants/session"
import { publicUser } from "@repo/shared-types"

const UserEditSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  nickname: z.string().min(1, "닉네임을 입력해주세요."),
  bio: z.string().optional(),
  sessions: z
    .array(z.number().int())
    .min(1, "최소 하나의 세션을 선택해야 합니다.")
})

type UserEditValues = z.infer<typeof UserEditSchema>

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: UserEditValues) => void
  editingUser: publicUser | null
  isPending?: boolean
}

export function UserFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editingUser,
  isPending = false
}: UserFormDialogProps) {
  const { data: sessions } = useSessions()

  const form = useForm<UserEditValues>({
    resolver: zodResolver(UserEditSchema),
    defaultValues: {
      name: "",
      nickname: "",
      bio: "",
      sessions: []
    }
  })

  useEffect(() => {
    if (open && editingUser) {
      form.reset({
        name: editingUser.name,
        nickname: editingUser.nickname,
        bio: editingUser.bio ?? "",
        sessions: editingUser.sessions.map((s) => s.id)
      })
    }
  }, [open, editingUser, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingUser?.name} 회원 편집</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>닉네임</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>소개</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sessions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>세션</FormLabel>
                  <div className="space-y-2">
                    {sessions?.map((session) => (
                      <label
                        key={session.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={field.value.includes(session.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, session.id])
                            } else {
                              field.onChange(
                                field.value.filter((id) => id !== session.id)
                              )
                            }
                          }}
                        />
                        {getSessionDisplayName(session.name)}
                      </label>
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
                {isPending ? "저장 중..." : "수정"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
