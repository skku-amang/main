"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ImagePlus, Loader2, X } from "lucide-react"
import { useRef } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { EquipCategory } from "@repo/database/enums"
import { Equipment } from "@repo/shared-types"
import { useQueryClient } from "@tanstack/react-query"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import SimpleLabel from "@/components/Form/SimpleLabel"
import { useToast } from "@/components/hooks/use-toast"
import {
  useCreateEquipment,
  useUpdateEquipment
} from "@/hooks/api/useEquipment"
import { useImageUpload } from "@/hooks/useImageUpload"

const CATEGORY_OPTIONS: { value: EquipCategory; label: string }[] = [
  { value: EquipCategory.GUITAR, label: "기타" },
  { value: EquipCategory.MICROPHONE, label: "마이크" },
  { value: EquipCategory.MIXER, label: "믹서" },
  { value: EquipCategory.BASS, label: "베이스" },
  { value: EquipCategory.SPEAKER, label: "스피커" },
  { value: EquipCategory.SYNTHESIZER, label: "신디사이저" },
  { value: EquipCategory.AUDIO_INTERFACE, label: "오디오 인터페이스" },
  { value: EquipCategory.AMPLIFIER, label: "앰프" },
  { value: EquipCategory.DRUM, label: "드럼" },
  { value: EquipCategory.CABLE, label: "케이블" },
  { value: EquipCategory.ETC, label: "기타(그 외)" }
]

const formSchema = z.object({
  brand: z.string().min(1, "장비 브랜드 명은 필수입니다."),
  model: z.string().min(1, "장비 모델 명은 필수입니다."),
  category: z.nativeEnum(EquipCategory, {
    required_error: "장비 카테고리는 필수입니다."
  }),
  description: z.string().optional(),
  image: z.string().url().nullable().optional()
})

type FormValues = z.infer<typeof formSchema>

interface EquipmentFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment?: Equipment | null
}

export default function EquipmentFormModal({
  open,
  onOpenChange,
  equipment
}: EquipmentFormModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const createEquipment = useCreateEquipment()
  const updateEquipment = useUpdateEquipment()
  const isEditing = !!equipment

  const imageUpload = useImageUpload({
    onSuccess: (publicUrl) => {
      form.setValue("image", publicUrl)
    }
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: equipment
      ? {
          brand: equipment.brand,
          model: equipment.model,
          category: equipment.category,
          description: equipment.description ?? "",
          image: equipment.image ?? null
        }
      : {
          brand: "",
          model: "",
          description: "",
          image: null
        }
  })

  const displayImage = imageUpload.preview ?? form.watch("image")

  const handleRemoveImage = () => {
    imageUpload.reset()
    form.setValue("image", null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const onSubmit = (values: FormValues) => {
    if (isEditing) {
      updateEquipment.mutate([equipment.id, values], {
        onSuccess: () => {
          toast({ title: "장비 수정 성공" })
          queryClient.invalidateQueries({ queryKey: ["equipments"] })
          onOpenChange(false)
        },
        onError: () => {
          toast({
            title: "장비 수정 실패",
            description: "입력한 내용을 확인해주세요.",
            variant: "destructive"
          })
        }
      })
    } else {
      createEquipment.mutate([values], {
        onSuccess: () => {
          toast({ title: "장비 등록 성공" })
          queryClient.invalidateQueries({ queryKey: ["equipments"] })
          onOpenChange(false)
          form.reset()
          imageUpload.reset()
        },
        onError: () => {
          toast({
            title: "장비 등록 실패",
            description: "입력한 내용을 확인해주세요.",
            variant: "destructive"
          })
        }
      })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          form.reset()
          imageUpload.reset()
        }
        onOpenChange(value)
      }}
    >
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? "장비 수정" : "장비 추가"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "수정할 장비의 정보를 입력해 주세요"
              : "추가할 장비의 정보를 입력해 주세요"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <SimpleLabel required>장비명</SimpleLabel>
                  <FormControl>
                    <Input placeholder="예: ROLAND Synth" {...field} />
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
                  <SimpleLabel required>모델명</SimpleLabel>
                  <FormControl>
                    <Input placeholder="예: RD-2000EX" {...field} />
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
                  <SimpleLabel required>카테고리</SimpleLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <SimpleLabel>장비 설명</SimpleLabel>
                  <FormControl>
                    <Input placeholder="예: 88 keys" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 장비 이미지 */}
            <div>
              <SimpleLabel>장비 이미지</SimpleLabel>
              <div className="mt-1 flex items-center gap-3">
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
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-28"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="w-28"
                disabled={
                  createEquipment.isPending ||
                  updateEquipment.isPending ||
                  imageUpload.isUploading
                }
              >
                저장
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
