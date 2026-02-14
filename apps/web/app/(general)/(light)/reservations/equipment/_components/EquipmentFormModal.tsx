"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { EquipCategory } from "@repo/database"
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
  description: z.string().optional()
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: equipment
      ? {
          brand: equipment.brand,
          model: equipment.model,
          category: equipment.category,
          description: equipment.description ?? ""
        }
      : {
          brand: "",
          model: "",
          description: ""
        }
  })

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
        if (!value) form.reset()
        onOpenChange(value)
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {isEditing ? "장비 수정" : "장비 추가"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "수정할 장비의 정보를 입력해주세요"
              : "추가할 장비의 정보를 입력해주세요"}
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

            {/* TODO: 장비 이미지 업로드 (백엔드 이미지 업로드 구현 후) */}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={
                  createEquipment.isPending || updateEquipment.isPending
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
