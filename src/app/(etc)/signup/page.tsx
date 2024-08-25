'use client'

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import SimpleStringField from "@/components/common/Form/SimpleStringField"
import { Button } from "@/components/ui/button"
import dummySessions from "@/lib/dummy/Session"
import { Checkbox } from "@/components/ui/checkbox"
import SimpleLabel from "@/components/common/Form/SimpleLabel"

const sessions = dummySessions

const passwordRegex =
  /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d!@$%&*?]$/;
const formSchema = z.object({
  name: z.string({ required_error: "필수 항목" }).min(2, { message: "최소 2자" }).max(4, { message: "최대 4자" }),
  nickname: z.string({ required_error: "필수 항목" }).min(2, { message: "최소 2자" }).max(4, { message: "최대 10자" }),
  email: z.string().email({ message: "올바른 이메일 형식을 입력해주세요 "}).optional(),
  sessions: z.array(z.string()).min(1, {
    message: "최소 1개의 세션을 선택해주세요.",
  }).refine((value) => value.some((item) => item)),
  password: z
    .string({ required_error: "필수 항목" })
    .min(8, { message: "8자리 이상 입력해 주세요." })
    .max(20, { message: "20자리 이하 입력해 주세요." })
    .regex(passwordRegex, {
      message: "영문, 숫자를 모두 조합해 주세요.",
    }),
  confirmPassword: z
    .string({ required_error: "필수 항목" }).min(8, { message: "8자리 이상 입력해 주세요." }).max(20, { message: "20자리 이하 입력해 주세요." })
})

const Signup = () => {
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
    <div className="container">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full mb-3">
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
            placeholder="베이스!==기타"
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
            required={!(formSchema.shape.confirmPassword instanceof z.ZodOptional)}
          />

          <SimpleStringField
            form={form}
            name="email"
            label="이메일"
            placeholder="example@g.skku.edu"
            required={!(formSchema.shape.email instanceof z.ZodOptional)}
          />


          <FormField
            control={form.control}
            name="sessions"
            render={() => (
              <FormItem>
                <div>
                  <SimpleLabel required={!(formSchema.shape.sessions instanceof z.ZodOptional)}>세션</SimpleLabel>
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
                          className="flex flex-row items-start space-x-3 space-y-0"
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
    </div>
  )
}

export default Signup