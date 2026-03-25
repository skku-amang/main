"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  CreateEquipment,
  CreateEquipmentSchema,
  Equipment
} from "@repo/shared-types"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

const CATEGORY_OPTIONS = [
  { value: "ROOM", label: "동아리방" },
  { value: "SYNTHESIZER", label: "신디사이저" },
  { value: "MICROPHONE", label: "마이크" },
  { value: "GUITAR", label: "기타" },
  { value: "BASS", label: "베이스" },
  { value: "DRUM", label: "드럼" },
  { value: "AUDIO_INTERFACE", label: "오디오 인터페이스" },
  { value: "CABLE", label: "케이블" },
  { value: "AMPLIFIER", label: "앰프" },
  { value: "SPEAKER", label: "스피커" },
  { value: "MIXER", label: "믹서" },
  { value: "ETC", label: "기타(기타)" }
] as const

// Form schema without image (admin panel doesn't handle image upload yet)
const FormSchema = CreateEquipmentSchema.omit({ image: true })

interface EquipmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateEquipment) => void
  editingEquipment: Equipment | null
  isPending: boolean
}

export function EquipmentFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editingEquipment,
  isPending
}: EquipmentFormDialogProps) {
  const form = useForm<Omit<CreateEquipment, "image">>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      brand: "",
      model: "",
      category: "ETC" as const,
      isAvailable: true,
      description: ""
    }
  })

  useEffect(() => {
    if (open) {
      if (editingEquipment) {
        form.reset({
          brand: editingEquipment.brand,
          model: editingEquipment.model,
          category: editingEquipment.category,
          isAvailable: editingEquipment.isAvailable,
          description: editingEquipment.description ?? ""
        })
      } else {
        form.reset({
          brand: "",
          model: "",
          category: "ETC" as const,
          isAvailable: true,
          description: ""
        })
      }
    }
  }, [open, editingEquipment, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingEquipment ? "장비 수정" : "장비 생성"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) =>
              onSubmit(data as CreateEquipment)
            )}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>브랜드</FormLabel>
                  <FormControl>
                    <Input placeholder="예: SHURE" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>모델</FormLabel>
                  <FormControl>
                    <Input placeholder="예: SM58" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카테고리</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
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
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel className="cursor-pointer">사용 가능</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
                    <Textarea
                      placeholder="장비 설명 (선택)"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "처리 중..." : editingEquipment ? "수정" : "생성"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
