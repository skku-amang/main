"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Camera, KeyRound, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { UpdatePasswordSchema, UpdateProfileSchema } from "@repo/shared-types"

import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import { useToast } from "@/components/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import ROUTES from "@/constants/routes"

import { getSessionDisplayName } from "@/constants/session"
import { ME_QUERY_KEY } from "@/hooks/api/useAuth"
import { useSessions } from "@/hooks/api/useSession"
import { useUpdatePassword, useUpdateProfile } from "@/hooks/api/useUser"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useImageUpload } from "@/hooks/useImageUpload"

import AvatarCropDialog from "./_components/AvatarCropDialog"

const ProfileFormSchema = UpdateProfileSchema.pick({
  name: true,
  nickname: true,
  bio: true,
  sessions: true,
  image: true,
  isProfilePublic: true
})

const PasswordFormSchema = UpdatePasswordSchema.extend({
  confirmPassword: z.string().min(1, "새 비밀번호를 다시 한번 입력해주세요.")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "새 비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"]
})

type ProfileFormValues = z.infer<typeof ProfileFormSchema>
type PasswordFormValues = z.infer<typeof PasswordFormSchema>

const EditSkeleton = () => (
  <div>
    <DefaultPageHeader title={<Skeleton className="mx-auto h-8 w-40" />} />
    <div className="mx-auto max-w-2xl space-y-6">
      <Skeleton className="h-[400px] rounded-xl" />
      <Skeleton className="h-[250px] rounded-xl" />
    </div>
  </div>
)

const ProfileEditPage = () => {
  const { user, isLoading, isAuthenticated } = useCurrentUser()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const updateProfileMutation = useUpdateProfile()
  const updatePasswordMutation = useUpdatePassword()
  const { data: sessions } = useSessions()
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const imageUpload = useImageUpload({
    onSuccess: (publicUrl) => {
      profileForm.setValue("image", publicUrl)
    }
  })

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
    values: {
      name: user?.name ?? "",
      nickname: user?.nickname ?? "",
      bio: user?.bio ?? "",
      sessions: user?.sessions.map((s) => s.id) ?? [],
      image: user?.image ?? undefined,
      isProfilePublic: user?.isProfilePublic ?? false
    }
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(PasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  })

  const handleProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation
      .mutateAsync([data])
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: ["users"] })
        queryClient.invalidateQueries({ queryKey: ["memberProfile"] })
        toast({ title: "프로필이 수정되었습니다." })
      })
      .catch((error) => {
        toast({
          title: "프로필 수정에 실패했습니다.",
          description: (error as Error).message,
          variant: "destructive"
        })
      })
  }

  const handlePasswordSubmit = (data: PasswordFormValues) => {
    const { confirmPassword, ...payload } = data
    updatePasswordMutation
      .mutateAsync([payload])
      .then(() => {
        toast({ title: "비밀번호가 변경되었습니다." })
        passwordForm.reset()
      })
      .catch((error) => {
        toast({
          title: "비밀번호 변경에 실패했습니다.",
          description: (error as Error).message,
          variant: "destructive"
        })
      })
  }

  if (isLoading) return <EditSkeleton />

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-4 text-lg text-slate-500">로그인이 필요합니다.</p>
        <Button asChild variant="outline">
          <Link href={ROUTES.LOGIN}>로그인</Link>
        </Button>
      </div>
    )
  }

  const currentImage = profileForm.watch("image")
  const profileImage =
    imageUpload.preview ??
    currentImage ??
    `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(user.email)}`

  return (
    <div>
      <DefaultPageHeader
        title="프로필 편집"
        routes={[
          { display: <DefaultHomeIcon />, href: ROUTES.HOME },
          { display: "내 프로필", href: ROUTES.PROFILE.INDEX },
          { display: "편집" }
        ]}
      />

      <div className="mx-auto max-w-2xl space-y-6">
        {/* 뒤로가기 */}
        <Button asChild variant="ghost" size="sm">
          <Link href={ROUTES.PROFILE.INDEX}>
            <ArrowLeft className="mr-1.5 size-4" />
            돌아가기
          </Link>
        </Button>

        {/* 프로필 정보 수정 */}
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h3 className="mb-6 text-lg font-semibold">기본 정보</h3>

          {/* 아바타 업로드 */}
          <div className="mb-6 flex items-center gap-4">
            <button
              type="button"
              aria-label="프로필 사진 바꾸기"
              className="group relative"
              onClick={() => imageUpload.inputRef.current?.click()}
              disabled={imageUpload.isUploading}
            >
              <Avatar className="size-16 border-2 border-slate-100">
                <AvatarImage src={profileImage} />
                <AvatarFallback className="text-xl">
                  {user.name?.[0]}
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
              name="avatar"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0]
                if (selected) setCropSrc(URL.createObjectURL(selected))
                e.target.value = ""
              }}
            />
            <AvatarCropDialog
              key={cropSrc}
              src={cropSrc}
              onCancel={() => setCropSrc(null)}
              onConfirm={(cropped) => {
                setCropSrc(null)
                imageUpload.validateAndUpload(cropped)
              }}
            />
            <div className="text-sm text-slate-500">
              {imageUpload.isUploading
                ? `업로드 중... ${imageUpload.progress}%`
                : (imageUpload.error ??
                  "클릭하여 프로필 이미지를 변경할 수 있습니다.")}
            </div>
          </div>

          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
              className="space-y-5"
            >
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="홍길동"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>닉네임</FormLabel>
                    <FormControl>
                      <Input placeholder="amang123" {...field} />
                    </FormControl>
                    <FormDescription>
                      다른 사용자에게 표시되는 고유한 이름입니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>소개</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="자기소개를 작성해주세요"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="sessions"
                render={({ field }) => (
                  <FormItem>
                    {/* 체크박스 여러 개를 묶는 제목이라 특정 입력칸을 가리키는 label 대신 group 이름으로 */}
                    <p
                      id="sessions-label"
                      className="text-sm font-medium leading-none"
                    >
                      세션
                    </p>
                    <FormDescription>
                      맡을 수 있는 악기를 모두 골라주세요.
                    </FormDescription>
                    <div
                      role="group"
                      aria-labelledby="sessions-label"
                      className="grid grid-cols-3 gap-3 pt-1"
                    >
                      {sessions?.map((session) => (
                        <label
                          key={session.id}
                          className="flex items-center gap-x-2 text-sm"
                        >
                          <Checkbox
                            name="sessions"
                            value={String(session.id)}
                            checked={field.value?.includes(session.id)}
                            onCheckedChange={(checked) =>
                              field.onChange(
                                checked
                                  ? [...(field.value ?? []), session.id]
                                  : field.value?.filter(
                                      (id) => id !== session.id
                                    )
                              )
                            }
                          />

                          <FormField
                            control={profileForm.control}
                            name="isProfilePublic"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
                                <div className="space-y-1">
                                  <FormLabel>
                                    다른 부원에게 프로필 공개
                                  </FormLabel>
                                  <FormDescription>
                                    켜면 로그인한 부원이 내 기수·세션·소개와
                                    참여한 팀·공연을 볼 수 있어요. 끄면 이름과
                                    사진만 보여요.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value ?? false}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          {getSessionDisplayName(session.name)}
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="rounded-full"
                >
                  <Save className="mr-1.5 size-4" />
                  {updateProfileMutation.isPending ? "저장 중..." : "저장"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* 비밀번호 변경 */}
        <div className="rounded-xl bg-white p-6 shadow-sm md:p-8">
          <h3 className="mb-6 text-lg font-semibold">
            <KeyRound className="mr-2 inline size-5" />
            비밀번호 변경
          </h3>

          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
              className="space-y-5"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>현재 비밀번호</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>새 비밀번호</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      영문, 숫자, 특수문자를 각각 1개 이상 포함한 8자 이상
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호 확인</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={updatePasswordMutation.isPending}
                  variant="outline"
                  className="rounded-full"
                >
                  <KeyRound className="mr-1.5 size-4" />
                  {updatePasswordMutation.isPending ? "변경 중..." : "변경"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default ProfileEditPage
