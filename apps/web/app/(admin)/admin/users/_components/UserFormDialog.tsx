"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Camera, Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Textarea } from "@/components/ui/textarea"
import { getSessionDisplayName } from "@/constants/session"
import { useGenerations } from "@/hooks/api/useGeneration"
import { useSessions } from "@/hooks/api/useSession"
import { useImageUpload } from "@/hooks/useImageUpload"
import { formatGenerationOrder } from "@/lib/utils"
import { publicUser } from "@repo/shared-types"

const UserEditSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  nickname: z.string().min(1, "닉네임을 입력해주세요."),
  bio: z.string().optional(),
  image: z
    .string()
    .url({ message: "유효한 이미지 주소(URL)를 입력해 주세요." })
    .nullable()
    .optional(),
  generationId: z.number({ invalid_type_error: "기수를 선택해주세요." }).int(),
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
  const { data: generations } = useGenerations()

  const form = useForm<UserEditValues>({
    resolver: zodResolver(UserEditSchema),
    defaultValues: {
      name: "",
      nickname: "",
      bio: "",
      image: null,
      generationId: undefined,
      sessions: []
    }
  })

  const imageUpload = useImageUpload({
    onSuccess: (publicUrl) => {
      form.setValue("image", publicUrl, { shouldDirty: true })
    }
  })

  useEffect(() => {
    if (open && editingUser) {
      form.reset({
        name: editingUser.name,
        nickname: editingUser.nickname,
        bio: editingUser.bio ?? "",
        image: editingUser.image ?? null,
        generationId: editingUser.generation.id,
        sessions: editingUser.sessions.map((s) => s.id)
      })
    }
  }, [open, editingUser, form])

  const sortedGenerations = generations
    ?.slice()
    .sort((a, b) => b.order - a.order)

  const currentImage = form.watch("image")
  const previewImage = imageUpload.preview ?? currentImage ?? undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingUser?.name} 회원 편집</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="group relative"
                onClick={() => imageUpload.inputRef.current?.click()}
                disabled={imageUpload.isUploading}
              >
                <Avatar className="size-16 border-2 border-slate-100">
                  <AvatarImage src={previewImage} />
                  <AvatarFallback className="text-xl">
                    {editingUser?.name?.[0] ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  {imageUpload.isUploading ? (
                    <Loader2 className="size-5 animate-spin text-white" />
                  ) : (
                    <Camera className="size-5 text-white" />
                  )}
                </div>
              </button>
              <input
                ref={imageUpload.inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={imageUpload.selectAndUpload}
              />
              <div className="text-sm text-slate-500">
                {imageUpload.isUploading
                  ? `업로드 중... ${imageUpload.progress}%`
                  : (imageUpload.error ??
                    "클릭하여 프로필 이미지를 변경할 수 있습니다.")}
              </div>
            </div>

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
              name="generationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>기수</FormLabel>
                  <Select
                    value={field.value !== undefined ? String(field.value) : ""}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="기수 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sortedGenerations?.map((g) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {formatGenerationOrder(g.order)}기
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
