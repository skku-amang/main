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
import { Performance } from "@repo/shared-types"

// Admin용 간소화 스키마 (posterImage 파일 업로드 제외)
const AdminPerformanceSchema = z.object({
  name: z.string().min(1, "공연 이름은 필수입니다."),
  description: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  startAt: z.string().nullable().optional(),
  endAt: z.string().nullable().optional()
})

type AdminPerformanceForm = z.infer<typeof AdminPerformanceSchema>

interface PerformanceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: AdminPerformanceForm) => void
  editingPerformance?: Performance | null
  isPending?: boolean
}

function toDatetimeLocal(date: Date | string | null | undefined): string {
  if (!date) return ""
  const d = new Date(date)
  if (isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 16)
}

export function PerformanceFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editingPerformance,
  isPending = false
}: PerformanceFormDialogProps) {
  const isEditing = !!editingPerformance

  const form = useForm<AdminPerformanceForm>({
    resolver: zodResolver(AdminPerformanceSchema),
    defaultValues: {
      name: "",
      description: null,
      location: null,
      startAt: null,
      endAt: null
    }
  })

  useEffect(() => {
    if (open && editingPerformance) {
      form.reset({
        name: editingPerformance.name,
        description: editingPerformance.description,
        location: editingPerformance.location,
        startAt: toDatetimeLocal(editingPerformance.startAt),
        endAt: toDatetimeLocal(editingPerformance.endAt)
      })
    } else if (open) {
      form.reset({
        name: "",
        description: null,
        location: null,
        startAt: null,
        endAt: null
      })
    }
  }, [open, editingPerformance, form])

  const handleSubmit = (data: AdminPerformanceForm) => {
    onSubmit({
      ...data,
      startAt: data.startAt || null,
      endAt: data.endAt || null
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `${editingPerformance.name} 편집` : "공연 생성"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>공연명</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>장소</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시작일시</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value ?? ""}
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
                    <FormLabel>종료일시</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
