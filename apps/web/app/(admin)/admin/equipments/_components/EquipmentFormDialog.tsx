"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  CreateEquipment,
  CreateEquipmentSchema,
  Equipment
} from "@repo/shared-types"
import { ImagePlus, Loader2, X } from "lucide-react"
import { useEffect, useRef } from "react"
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
import { useImageUpload } from "@/hooks/useImageUpload"

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

const FormSchema = CreateEquipmentSchema

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
  const form = useForm<CreateEquipment>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      brand: "",
      model: "",
      category: "ETC" as const,
      isAvailable: true,
      description: "",
      image: null
    }
  })

  const imageUpload = useImageUpload({
    onSuccess: (publicUrl) => {
      form.setValue("image", publicUrl)
    }
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const displayImage = imageUpload.preview ?? form.watch("image")

  const handleRemoveImage = () => {
    imageUpload.reset()
    form.setValue("image", null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  useEffect(() => {
    if (open) {
      imageUpload.reset()
      if (editingEquipment) {
        form.reset({
          brand: editingEquipment.brand,
          model: editingEquipment.model,
          category: editingEquipment.category,
          isAvailable: editingEquipment.isAvailable,
          description: editingEquipment.description ?? "",
          image: editingEquipment.image ?? null
        })
      } else {
        form.reset({
          brand: "",
          model: "",
          category: "ETC" as const,
          isAvailable: true,
          description: "",
          image: null
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 이미지 업로드 */}
            <FormItem>
              <FormLabel>이미지</FormLabel>
              <div className="flex items-center gap-3">
                {displayImage ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border">
                    <img
                      src={displayImage}
                      alt="장비 이미지"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground shadow-sm"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary"
                  >
                    <ImagePlus size={24} />
                  </button>
                )}
                <div className="flex flex-col gap-1">
                  {!displayImage && (
                    <p className="text-sm text-muted-foreground">
                      JPEG, PNG, WebP (최대 20MB)
                    </p>
                  )}
                  {imageUpload.isUploading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 size={14} className="animate-spin" />
                      업로드 중... {imageUpload.progress}%
                    </div>
                  )}
                  {imageUpload.error && (
                    <p className="text-sm text-destructive">
                      {imageUpload.error}
                    </p>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={imageUpload.selectAndUpload}
              />
            </FormItem>

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
              <Button
                type="submit"
                disabled={isPending || imageUpload.isUploading}
              >
                {isPending ? "처리 중..." : editingEquipment ? "수정" : "생성"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
