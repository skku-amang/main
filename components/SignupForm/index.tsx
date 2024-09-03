'use client'

import {
  emailSchema,
  nameSchema,
  nicknameSchema,
  passwordSchema
} from '@/constants/zodSchema'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import SimpleLabel from '@/components/common/Form/SimpleLabel'
import SimpleStringField from '@/components/common/Form/SimpleStringField'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import dummySessions from '@/lib/dummy/Session'
const sessions = dummySessions

const formSchema = z.object({
  name: nameSchema,
  nickname: nicknameSchema,
  email: emailSchema,
  sessions: z
    .array(z.string())
    .min(1, {
      message: '최소 1개의 세션을 선택해주세요.'
    })
    .refine((value) => value.some((item) => item)),
  password: passwordSchema,
  confirmPassword: z
    .string({ required_error: '필수 항목' })
    .min(8, { message: '8자리 이상 입력해 주세요.' })
    .max(20, { message: '20자리 이하 입력해 주세요.' })
})

export function SignupForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sessions: []
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)} // TODO: 부모 요소인 Form으로 이전
        className="felx mb-3 w-full flex-col space-y-8"
      >
        <SimpleStringField
          form={form}
          name="name"
          label="이름"
          placeholder="김아망"
          description="실명을 입력해주세요."
          required={!(formSchema.shape.name instanceof z.ZodOptional)}
        />
        <SimpleStringField
          form={form}
          name="nickname"
          label="닉네임"
          placeholder="베이스 !== 기타"
          description="개성 넘치는 닉네임을 입력해주세요."
          required={!(formSchema.shape.nickname instanceof z.ZodOptional)}
        />
        <SimpleStringField
          form={form}
          name="password"
          label="비밀번호"
          description="5~20자, 영문+숫자"
          required={!(formSchema.shape.password instanceof z.ZodOptional)}
        />
        <SimpleStringField
          form={form}
          name="confirmPassword"
          label="비밀번호 확인"
          description="오타 내면 바보~"
          required={
            !(formSchema.shape.confirmPassword instanceof z.ZodOptional)
          }
        />

        <SimpleStringField
          form={form}
          name="email"
          label="이메일"
          placeholder="example@g.skku.edu"
          description="@g.skku.edu 이메일 입력해주세요"
          required={!(formSchema.shape.email instanceof z.ZodOptional)}
        />

        <FormField
          control={form.control}
          name="sessions"
          render={() => (
            <FormItem>
              <div>
                <SimpleLabel
                  required={
                    !(formSchema.shape.sessions instanceof z.ZodOptional)
                  }
                >
                  세션
                </SimpleLabel>
                <FormDescription>
                  연주 가능한 세션을 선택해주세요.
                </FormDescription>
              </div>
              {sessions.map((session) => (
                <FormField
                  key={session.name}
                  control={form.control}
                  name="sessions"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={session.name}
                        className="flex flex-row items-start space-x-3 space-y-0 py-0.5"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(session.name)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, session.name])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== session.name
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
