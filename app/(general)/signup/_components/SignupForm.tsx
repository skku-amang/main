"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import SimpleLabel from "@/components/Form/SimpleLabel"
import SimpleStringField from "@/components/Form/SimpleStringField"
import { useToast } from "@/components/hooks/use-toast"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ROUTES from "@/constants/routes"
import { password, signUpSchema as _signUpSchema } from "@/constants/zodSchema"
import {
  DuplicatedCredentialsErrorCode,
  InvalidSignupCredentialsErrorCode
} from "@/lib/auth/errors"
import { Generation } from "@/types/Generation"
import { Session } from "@/types/Session"

const signUpSchema = _signUpSchema
  .merge(z.object({ confirmPassword: password }))
  .refine((data) => data.password === data.confirmPassword, {
    message: "패스워드가 일치하지 않습니다.",
    path: ["confirmPassword"]
  })

interface SignupFormProps {
  sessions: Session[]
  generations: Generation[]
}

const SignupForm = ({ sessions, generations }: SignupFormProps) => {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      sessions: []
    }
  })

  async function onSubmit(formData: z.infer<typeof signUpSchema>) {
    const res = await signIn("credentials", {
      name: formData.name,
      nickname: formData.nickname,
      email: formData.email,
      password: formData.password,
      sessions: formData.sessions,
      generation: formData.generation,
      redirect: false
    })
    if (!res?.error) return router.push(ROUTES.HOME)

    const shouldBeUniqueFields = ["nickname", "email"]
    const allFields = Object.keys(signUpSchema._def.schema.shape)
    switch (res.code) {
      case DuplicatedCredentialsErrorCode:
        shouldBeUniqueFields.forEach((key) => {
          form.setError(key as keyof z.infer<typeof signUpSchema>, {
            type: "manual",
            message: "이미 가입된 회원 정보입니다."
          })
        })
        toast({
          title: "회원가입 실패",
          description: "이미 가입된 회원 정보입니다.",
          variant: "destructive"
        })
        break

      case InvalidSignupCredentialsErrorCode:
        allFields.forEach((key) => {
          form.setError(key as keyof z.infer<typeof signUpSchema>, {
            type: "manual",
            message: "회원가입 정보가 올바르지 않습니다."
          })
        })
        toast({
          title: "회원가입 실패",
          description: "회원가입 정보가 올바르지 않습니다.",
          variant: "destructive"
        })
        break

      default:
        toast({
          title: "회원가입 실패",
          description: "알 수 없는 에러 발생!",
          variant: "destructive"
        })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full w-[38.875rem] space-y-6 p-5 lg:p-24 xl:w-full"
      >
        <SimpleStringField
          form={form}
          name="name"
          label="이름"
          placeholder="김아망"
          description={signUpSchema._def.schema.shape.name.description}
          required={
            !(signUpSchema._def.schema.shape.name instanceof z.ZodOptional)
          }
        />
        <SimpleStringField
          form={form}
          name="nickname"
          label="닉네임"
          placeholder="베이스 !== 기타"
          description={signUpSchema._def.schema.shape.nickname.description}
          required={
            !(signUpSchema._def.schema.shape.nickname instanceof z.ZodOptional)
          }
        />
        <SimpleStringField
          form={form}
          name="email"
          label="이메일"
          placeholder="example@g.skku.edu"
          description={signUpSchema._def.schema.shape.email.description}
          required={
            !(signUpSchema._def.schema.shape.email instanceof z.ZodOptional)
          }
        />
        <SimpleStringField
          form={form}
          name="password"
          label="비밀번호"
          placeholder="비밀번호"
          description={signUpSchema._def.schema.shape.password.description}
          required={
            !(signUpSchema._def.schema.shape.password instanceof z.ZodOptional)
          }
          inputType="password"
        />
        <SimpleStringField
          form={form}
          name="confirmPassword"
          label="비밀번호 확인"
          placeholder="비밀번호 확인"
          description={signUpSchema._def.schema.shape.password.description}
          required={
            !(
              signUpSchema._def.schema.shape.confirmPassword instanceof
              z.ZodOptional
            )
          }
          inputType="password"
        />

        <FormField
          control={form.control}
          name="generation"
          render={({ field }) => (
            <FormItem>
              <div>
                <SimpleLabel
                  required={
                    !(
                      signUpSchema._def.schema.shape.generation instanceof
                      z.ZodOptional
                    )
                  }
                >
                  기수
                </SimpleLabel>
              </div>
              <Select value={field.value?.toString()} onValueChange={v => field.onChange(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {generations.map((generation) => (
                    <SelectItem key={generation.order} value={generation.id.toString()}>
                      {generation.order}기
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
          render={() => (
            <FormItem>
              <div>
                <SimpleLabel
                  required={
                    !(
                      signUpSchema._def.schema.shape.sessions instanceof
                      z.ZodOptional
                    )
                  }
                >
                  세션
                </SimpleLabel>
                <FormDescription>
                  연주 가능한 세션을 선택해주세요.
                </FormDescription>
              </div>
              {sessions &&
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
                            {session.name}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">회원가입</Button>
      </form>
    </Form>
  )
}

export default SignupForm
