"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ApiError } from "@repo/api-client"
import {
  EMAIL_CODE_LENGTH,
  PasswordResetConfirmSchema,
  passwordField
} from "@repo/shared-types"
import { useRouter } from "next/navigation"
import { Control, FieldValues, Path, useForm } from "react-hook-form"
import { z } from "zod"

import EmailCodeButton from "@/components/EmailCodeButton"
import { useToast } from "@/components/hooks/use-toast"
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
import ROUTES from "@/constants/routes"
import { apiClient } from "@/lib/apiClient"

const passwordsMatch = {
  check: (data: { newPassword: string; confirmPassword: string }) =>
    data.newPassword === data.confirmPassword,
  params: {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"]
  }
}

const CodeSchema = PasswordResetConfirmSchema.extend({
  confirmPassword: passwordField
}).refine(passwordsMatch.check, passwordsMatch.params)

const TokenSchema = z
  .object({ newPassword: passwordField, confirmPassword: passwordField })
  .refine(passwordsMatch.check, passwordsMatch.params)

const errorText = (error: unknown) =>
  error instanceof ApiError
    ? (error.detail ?? error.message)
    : "잠시 후 다시 시도해주세요."

type NewPasswordValues = FieldValues & {
  newPassword: string
  confirmPassword: string
}

const NewPasswordFields = <T extends NewPasswordValues>({
  control
}: {
  control: Control<T>
}) => (
  <>
    <FormField
      control={control}
      name={"newPassword" as Path<T>}
      render={({ field }) => (
        <FormItem>
          <FormLabel>새 비밀번호</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={field.value ?? ""}
              type="password"
              autoComplete="new-password"
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
      control={control}
      name={"confirmPassword" as Path<T>}
      render={({ field }) => (
        <FormItem>
          <FormLabel>새 비밀번호 확인</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={field.value ?? ""}
              type="password"
              autoComplete="new-password"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
)

/** 메일 인증번호로 찾기 — 이메일을 인증한 회원만 (#528) */
export const CodeResetForm = () => {
  const router = useRouter()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof CodeSchema>>({
    resolver: zodResolver(CodeSchema)
  })

  const sendCode = async () => {
    if (!(await form.trigger("email"))) throw new Error("이메일 형식 오류")
    try {
      await apiClient.requestPasswordReset(form.getValues("email"))
      toast({
        title: "메일함을 확인해주세요",
        description:
          "이메일을 인증한 계정이면 인증번호를 보냈어요. 스팸함도 확인해주세요."
      })
    } catch (error) {
      toast({
        title: "인증번호를 보내지 못했어요",
        description: errorText(error),
        variant: "destructive"
      })
      throw error
    }
  }

  const onSubmit = async ({
    email,
    code,
    newPassword
  }: z.infer<typeof CodeSchema>) => {
    try {
      await apiClient.resetPasswordWithCode({ email, code, newPassword })
      router.push(`${ROUTES.LOGIN}?reset=success`)
    } catch (error) {
      form.setError("code", { type: "manual", message: errorText(error) })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  type="email"
                  autoComplete="email"
                  placeholder="example@g.skku.edu"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>인증번호</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={EMAIL_CODE_LENGTH}
                    placeholder={`${EMAIL_CODE_LENGTH}자리 숫자`}
                  />
                </FormControl>
                <EmailCodeButton onSend={sendCode} className="shrink-0" />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <NewPasswordFields control={form.control} />
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          비밀번호 바꾸기
        </Button>
      </form>
    </Form>
  )
}

/** 운영진이 준 링크로 찾기 (#528) */
export const TokenResetForm = ({ token }: { token: string }) => {
  const router = useRouter()
  const form = useForm<z.infer<typeof TokenSchema>>({
    resolver: zodResolver(TokenSchema)
  })

  const onSubmit = async ({ newPassword }: z.infer<typeof TokenSchema>) => {
    try {
      await apiClient.resetPasswordWithToken({ token, newPassword })
      router.push(`${ROUTES.LOGIN}?reset=success`)
    } catch (error) {
      form.setError("root", { type: "manual", message: errorText(error) })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <NewPasswordFields control={form.control} />
        {form.formState.errors.root && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          비밀번호 바꾸기
        </Button>
      </form>
    </Form>
  )
}
