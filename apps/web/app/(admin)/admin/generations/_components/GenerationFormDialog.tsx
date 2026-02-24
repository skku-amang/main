"use client"

import { zodResolver } from "@hookform/resolvers/zod"
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
import { Input } from "@/components/ui/input"
import { UserSelectContent } from "@/app/(admin)/_components/UserSelectContent"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUsers } from "@/hooks/api/useUser"
import { formatGenerationOrder } from "@/lib/utils"
import {
  CreateGeneration,
  CreateGenerationSchema,
  GenerationWithBasicUsers
} from "@repo/shared-types"

interface GenerationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateGeneration) => void
  editingGeneration?: GenerationWithBasicUsers | null
  isPending?: boolean
}

export function GenerationFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editingGeneration,
  isPending = false
}: GenerationFormDialogProps) {
  const { data: users } = useUsers()
  const isEditing = !!editingGeneration

  const form = useForm<CreateGeneration>({
    resolver: zodResolver(CreateGenerationSchema),
    defaultValues: {
      order: 0,
      leaderId: undefined
    }
  })

  useEffect(() => {
    if (open && editingGeneration) {
      form.reset({
        order: editingGeneration.order / 2,
        leaderId: editingGeneration.leader?.id ?? undefined
      })
    } else if (open) {
      form.reset({ order: 0, leaderId: undefined })
    }
  }, [open, editingGeneration, form])

  const handleFormSubmit = (data: CreateGeneration) => {
    onSubmit({ ...data, order: data.order * 2 })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? `${formatGenerationOrder(editingGeneration.order)}기 편집`
              : "기수 생성"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>기수</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step={0.5}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
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
