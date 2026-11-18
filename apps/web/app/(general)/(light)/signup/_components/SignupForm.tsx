"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ApiError, ConflictError, ValidationError } from "@repo/api-client"
import {
  EMAIL_CODE_LENGTH,
  SignupSchema,
  passwordField,
  formatGenerationOrder
} from "@repo/shared-types"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"

import EmailCodeButton from "@/components/EmailCodeButton"
import SimpleDescription from "@/components/Form/SimpleDescription"
import SimpleLabel from "@/components/Form/SimpleLabel"
import SimpleStringField from "@/components/Form/SimpleStringField"
import { useToast } from "@/components/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import ROUTES from "@/constants/routes"
import { getSessionDisplayName } from "@/constants/session"
import { useGenerations } from "@/hooks/api/useGeneration"
import { useSessions } from "@/hooks/api/useSession"
import { apiClient } from "@/lib/apiClient"

const confirmPasswordMergedCreateUserSchema = SignupSchema.merge(
  z.object({ confirmPassword: passwordField })
).refine((data) => data.password === data.confirmPassword, {
  message: "패스워드가 일치하지 않습니다.",
  path: ["confirmPassword"]
})

const SignupForm = () => {
  const router = useRouter()
  const { toast } = useToast()
  const { data: sessions, status: sessionsStatus } = useSessions()
  const { data: generations, status: generationsStatus } = useGenerations()

  const form = useForm<z.infer<typeof confirmPasswordMergedCreateUserSchema>>({
    resolver: zodResolver(confirmPasswordMergedCreateUserSchema),
    defaultValues: {
      sessions: []
    }
  })

  async function sendEmailCode() {
    if (!(await form.trigger("email"))) throw new Error("이메일 형식 오류")
    try {
      await apiClient.requestSignupEmailCode(form.getValues("email"))
      toast({
        title: "인증번호를 보냈어요",
        description: "메일함(스팸함 포함)을 확인해주세요."
      })
    } catch (error) {
      if (error instanceof ConflictError) {
        form.setError("email", {
          type: "manual",
          message: "이미 가입된 이메일입니다."
        })
      } else {
        toast({
          title: "인증번호를 보내지 못했어요",
          description:
            error instanceof ApiError
              ? (error.detail ?? error.message)
              : "잠시 후 다시 시도해주세요.",
          variant: "destructive"
        })
      }
      throw error
    }
  }

  async function onSubmit(
    formData: z.infer<typeof confirmPasswordMergedCreateUserSchema>
  ) {
    try {
      await apiClient.signup({
        name: formData.name,
        nickname: formData.nickname,
        email: formData.email,
        emailCode: formData.emailCode,
        password: formData.password,
        sessions: formData.sessions,
        generationId: formData.generationId
      })
      router.push(ROUTES.LOGIN + "?signup=success")
    } catch (error) {
      if (error instanceof ConflictError) {
        const shouldBeUniqueFields = ["nickname", "email"]
        shouldBeUniqueFields.forEach((key) => {
          form.setError(
            key as keyof z.infer<typeof confirmPasswordMergedCreateUserSchema>,
            {
              type: "manual",
              message: "이미 가입된 회원 정보입니다."
            }
          )
        })
        toast({
          title: "이미 가입된 회원 정보입니다",
          description:
            "이미 가입하셨다면 로그인해주세요. 운영진 승인 전이라면 승인 후 로그인할 수 있습니다.",
          variant: "destructive"
        })
      } else if (
        error instanceof ValidationError &&
        error.detail?.includes("인증번호")
      ) {
        form.setError("emailCode", { type: "manual", message: error.detail })
      } else if (error instanceof ValidationError) {
        toast({
          title: "회원가입 실패",
          description: "회원가입 정보가 올바르지 않습니다.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "회원가입 실패",
          description: "알 수 없는 에러 발생!",
          variant: "destructive"
        })
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full w-full space-y-6 px-4 py-5 md:w-[38.875rem] md:p-5 lg:p-24 xl:w-full"
      >
        <SimpleStringField
          form={form}
          name="name"
          label="이름"
          placeholder="김아망"
          description={
            confirmPasswordMergedCreateUserSchema.shape.name.description
          }
          required={
            !(
              confirmPasswordMergedCreateUserSchema.shape.name instanceof
              z.ZodOptional
            )
          }
        />
        <SimpleStringField
          form={form}
          name="nickname"
          label="닉네임"
          placeholder="베이스 !== 기타"
          description={
            confirmPasswordMergedCreateUserSchema.shape.nickname.description
          }
          required={
            !(
              confirmPasswordMergedCreateUserSchema.shape.nickname instanceof
              z.ZodOptional
            )
          }
        />
        <SimpleStringField
          form={form}
          name="email"
          label="이메일"
          placeholder="example@g.skku.edu"
          description={
            confirmPasswordMergedCreateUserSchema.shape.email.description
          }
          required={
            !(
              confirmPasswordMergedCreateUserSchema.shape.email instanceof
              z.ZodOptional
            )
          }
        />
        <FormField
          control={form.control}
          name="emailCode"
          render={({ field }) => (
            <FormItem>
              <SimpleLabel required>이메일 인증번호</SimpleLabel>
              <div className="mt-[0.2rem] flex gap-2">
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={EMAIL_CODE_LENGTH}
                    placeholder={`${EMAIL_CODE_LENGTH}자리 숫자`}
                    className="border-slate-300 shadow-sm"
                  />
                </FormControl>
                <EmailCodeButton onSend={sendEmailCode} className="shrink-0" />
              </div>
              <SimpleDescription>
                위 이메일로 받은 인증번호를 입력해주세요. 비밀번호를 잊었을 때
                이 메일로 찾을 수 있어요.
              </SimpleDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <SimpleStringField
          form={form}
          name="password"
          label="비밀번호"
          placeholder="비밀번호"
          description={
            confirmPasswordMergedCreateUserSchema.shape.password.description
          }
          required={
            !(
              confirmPasswordMergedCreateUserSchema.shape.password instanceof
              z.ZodOptional
            )
          }
          inputType="password"
        />
        <SimpleStringField
          form={form}
          name="confirmPassword"
          label="비밀번호 확인"
          placeholder="비밀번호 확인"
          description={
            confirmPasswordMergedCreateUserSchema.shape.password.description
          }
          required={
            !(
              confirmPasswordMergedCreateUserSchema.shape
                .confirmPassword instanceof z.ZodOptional
            )
          }
          inputType="password"
        />

        <FormField
          control={form.control}
          name="generationId"
          render={({ field }) => (
            <FormItem>
              <div>
                <SimpleLabel
                  required={
                    !(
                      confirmPasswordMergedCreateUserSchema.shape
                        .generationId instanceof z.ZodOptional
                    )
                  }
                >
                  기수
                </SimpleLabel>
              </div>
              <Select
                value={field.value?.toString()}
                onValueChange={(v) => field.onChange(parseInt(v))}
              >
                {generationsStatus === "success" ? (
                  <>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {generations.map((generation) => (
                        <SelectItem
                          key={generation.order}
                          value={generation.id.toString()}
                        >
                          {formatGenerationOrder(generation.order)}기
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </>
                ) : (
                  <div>Loading...</div>
                )}
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sessions"
          render={() => (
            <FormItem>
              <div>
                <SimpleLabel
                  required={
                    !(
                      confirmPasswordMergedCreateUserSchema.shape
                        .sessions instanceof z.ZodOptional
                    )
                  }
                >
                  세션
                </SimpleLabel>
                <FormDescription>
                  자신의 세션을 선택해주세요(중복체크가능)
                </FormDescription>
              </div>
              {sessionsStatus !== "success" ? (
                <div>Loading...</div>
              ) : (
                sessions.map((session) => (
                  <FormField
                    key={session.id}
                    control={form.control}
                    name="sessions"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={session.id}
                          className="flex flex-row items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(session.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, session.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== session.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {getSessionDisplayName(session.name)}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-center gap-4 pt-8">
          <Button
            type="button"
            className="h-11 w-36 rounded-full bg-slate-200 font-semibold text-slate-600 hover:bg-slate-300"
            onClick={() => router.back()}
          >
            취소하기
          </Button>
          <Button
            type="submit"
            className="h-11 w-36 rounded-full font-semibold"
          >
            회원가입
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default SignupForm
