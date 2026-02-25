"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, KeyRound, Save } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"

import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import ROUTES from "@/constants/routes"
import { useCurrentUser } from "@/hooks/useCurrentUser"

const ProfileFormSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  nickname: z.string().min(1, "닉네임을 입력해주세요"),
  bio: z.string().optional()
})

const PasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요"),
    newPassword: z.string().min(6, "6자 이상 입력해주세요"),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
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
  const { session, user, isLoading, isAuthenticated } = useCurrentUser()

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
    values: {
      name: session?.user?.name ?? "",
      nickname: session?.user?.nickname ?? "",
      bio: user?.bio ?? ""
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

  if (isLoading) return <EditSkeleton />

  if (!isAuthenticated || !session) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-4 text-lg text-slate-500">로그인이 필요합니다.</p>
        <Button asChild variant="outline">
          <Link href={ROUTES.LOGIN}>로그인</Link>
        </Button>
      </div>
    )
  }

  const profileImage =
    session.user?.image ??
    `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(session.user?.email ?? "")}`

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

          {/* 아바타 미리보기 */}
          <div className="mb-6 flex items-center gap-4">
            <Avatar className="size-16 border-2 border-slate-100">
              <AvatarImage src={profileImage} />
              <AvatarFallback className="text-xl">
                {session.user?.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm text-slate-500">
              프로필 이미지 변경은 준비 중입니다.
            </div>
          </div>

          <Form {...profileForm}>
            <form className="space-y-5">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl>
                      <Input placeholder="홍길동" {...field} />
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

              <div className="flex justify-end">
                <Button type="submit" disabled className="rounded-full">
                  <Save className="mr-1.5 size-4" />
                  저장
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
            <form className="space-y-5">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>현재 비밀번호</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
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
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>6자 이상 입력해주세요.</FormDescription>
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
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled
                  variant="outline"
                  className="rounded-full"
                >
                  <KeyRound className="mr-1.5 size-4" />
                  변경
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
