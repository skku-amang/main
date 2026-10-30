"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import dayjs from "dayjs"
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
import {
  getPerformanceStage,
  Performance,
  PERFORMANCE_STAGE_LABEL
} from "@repo/shared-types"

// Admin용 간소화 스키마 (posterImage 파일 업로드 제외)
const AdminPerformanceSchema = z.object({
  name: z.string().min(1, "공연 이름은 필수입니다."),
  description: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  startAt: z.string().nullable().optional(),
  endAt: z.string().nullable().optional(),
  recruitStartAt: z.string().nullable().optional(),
  recruitEndAt: z.string().nullable().optional(),
  feedbackStartAt: z.string().nullable().optional(),
  feedbackEndAt: z.string().nullable().optional(),
  passCount: z.string().nullable().optional(),
  penaltyPerMissingReview: z.string().nullable().optional()
})

export type AdminPerformanceForm = z.infer<typeof AdminPerformanceSchema>

const toDate = (value: string | null | undefined) =>
  value ? new Date(value) : null

// datetime-local string을 Date로, 숫자 입력 문자열을 숫자로 변환
export const toPerformancePayload = (data: AdminPerformanceForm) => ({
  name: data.name,
  description: data.description,
  location: data.location,
  startAt: toDate(data.startAt),
  endAt: toDate(data.endAt),
  recruitStartAt: toDate(data.recruitStartAt),
  recruitEndAt: toDate(data.recruitEndAt),
  feedbackStartAt: toDate(data.feedbackStartAt),
  feedbackEndAt: toDate(data.feedbackEndAt),
  passCount: data.passCount ? Number(data.passCount) : null,
  penaltyPerMissingReview: data.penaltyPerMissingReview
    ? Number(data.penaltyPerMissingReview)
    : 0
})

// 진행 단계를 정하는 일정 — 순서대로 표시
const SCHEDULE_FIELDS = [
  ["recruitStartAt", "모집 시작"],
  ["recruitEndAt", "모집 종료"],
  ["feedbackStartAt", "피드백 시작 (녹음본 마감)"],
  ["feedbackEndAt", "피드백 종료"]
] as const

const emptyForm: AdminPerformanceForm = {
  name: "",
  description: null,
  location: null,
  startAt: null,
  endAt: null,
  recruitStartAt: null,
  recruitEndAt: null,
  feedbackStartAt: null,
  feedbackEndAt: null,
  passCount: null,
  penaltyPerMissingReview: null
}

interface PerformanceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: AdminPerformanceForm) => void
  editingPerformance?: Performance | null
  isPending?: boolean
}

// datetime-local 입력은 로컬 시각을 받는다. toISOString()(UTC)을 넣으면 한국에선 9시간 이르게 보인다
function toDatetimeLocal(date: Date | string | null | undefined): string {
  if (!date) return ""
  const d = dayjs(date)
  return d.isValid() ? d.format("YYYY-MM-DDTHH:mm") : ""
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
    defaultValues: emptyForm
  })

  useEffect(() => {
    if (open && editingPerformance) {
      form.reset({
        name: editingPerformance.name,
        description: editingPerformance.description,
        location: editingPerformance.location,
        startAt: toDatetimeLocal(editingPerformance.startAt),
        endAt: toDatetimeLocal(editingPerformance.endAt),
        recruitStartAt: toDatetimeLocal(editingPerformance.recruitStartAt),
        recruitEndAt: toDatetimeLocal(editingPerformance.recruitEndAt),
        feedbackStartAt: toDatetimeLocal(editingPerformance.feedbackStartAt),
        feedbackEndAt: toDatetimeLocal(editingPerformance.feedbackEndAt),
        passCount: editingPerformance.passCount?.toString() ?? null,
        penaltyPerMissingReview:
          editingPerformance.penaltyPerMissingReview?.toString() ?? null
      })
    } else if (open) {
      form.reset(emptyForm)
    }
  }, [open, editingPerformance, form])

  const handleSubmit = (data: AdminPerformanceForm) => {
    onSubmit({
      ...data,
      startAt: data.startAt || null,
      endAt: data.endAt || null
    })
  }

  // 지금 저장하면 어느 단계가 되는지 — 확정 여부는 폼에서 바꾸지 않으므로 편집 중 공연 값
  const values = form.watch()
  const previewStage = getPerformanceStage({
    recruitStartAt: toDate(values.recruitStartAt),
    recruitEndAt: toDate(values.recruitEndAt),
    feedbackStartAt: toDate(values.feedbackStartAt),
    feedbackEndAt: toDate(values.feedbackEndAt),
    decidedAt: editingPerformance?.decidedAt ?? null,
    endAt: toDate(values.endAt)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg"
        // 입력 창 — 바깥을 잘못 눌러 입력이 사라지지 않게. 닫기는 [취소]·Esc
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
      >
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

            <div className="grid grid-cols-2 gap-4">
              {SCHEDULE_FIELDS.map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>{label}</FormLabel>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() =>
                            field.onChange(toDatetimeLocal(new Date()))
                          }
                        >
                          지금으로
                        </Button>
                      </div>
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
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="passCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>합격 곡 수</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        step={1}
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
                name="penaltyPerMissingReview"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>미참여 1건당 감점</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.1}
                        placeholder="0"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              지금 저장하면 단계: {PERFORMANCE_STAGE_LABEL[previewStage]}
            </p>

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
