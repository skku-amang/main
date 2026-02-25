"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { SESSION_NAMES } from "@/constants/session"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

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
import { UserSelectContent } from "@/app/(admin)/_components/UserSelectContent"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { getSessionDisplayName } from "@/constants/session"
import { useUsers } from "@/hooks/api/useUser"
import {
  CreateSession,
  CreateSessionSchema,
  SessionWithBasicUsers
} from "@repo/shared-types"

interface SessionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateSession) => void
  editingSession?: SessionWithBasicUsers | null
  isPending?: boolean
}

export function SessionFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editingSession,
  isPending = false
}: SessionFormDialogProps) {
  const { data: users } = useUsers()
  const isEditing = !!editingSession

  const form = useForm<CreateSession>({
    resolver: zodResolver(CreateSessionSchema),
    defaultValues: {
      name: SESSION_NAMES.VOCAL,
      leaderId: undefined
    }
  })

  useEffect(() => {
    if (open && editingSession) {
      form.reset({
        name: editingSession.name,
        leaderId: editingSession.leader?.id ?? undefined
      })
    } else if (open) {
      form.reset({ name: SESSION_NAMES.VOCAL, leaderId: undefined })
    }
  }, [open, editingSession, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? `${getSessionDisplayName(editingSession.name)} 편집`
              : "세션 생성"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>세션명</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(SESSION_NAMES).map((name) => (
                        <SelectItem key={name} value={name}>
                          {getSessionDisplayName(name)}
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
              name="leaderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>리더</FormLabel>
                  <Select
                    value={field.value?.toString() ?? "none"}
                    onValueChange={(v) =>
                      field.onChange(v === "none" ? undefined : parseInt(v))
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="리더 선택 (선택사항)" />
                      </SelectTrigger>
                    </FormControl>
                    <UserSelectContent users={users} allowNone />
                  </Select>
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
