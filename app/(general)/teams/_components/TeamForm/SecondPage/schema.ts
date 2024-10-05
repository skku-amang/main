import { z } from "zod"

import { BLANK_USER_ID } from "@/types/User"

export const memberSessionRequiredField = ({
  session,
  index,
  required = false,
  member = BLANK_USER_ID
}: {
  session: string
  index: number
  required?: boolean
  member?: number
}) =>
  z.object({
    session: z.string().default(session).readonly(),
    index: z.number({ required_error: "필수 항목" }).default(index).readonly(),
    required: z.boolean({ required_error: "필수 항목" }).default(required),
    member: z.number().default(member).optional()
  })

export const memberSessionRequiredBaseSchema = z.object({
  보컬1: memberSessionRequiredField({ session: "보컬", index: 1 }),
  보컬2: memberSessionRequiredField({ session: "보컬", index: 2 }),
  보컬3: memberSessionRequiredField({ session: "보컬", index: 3 }),
  기타1: memberSessionRequiredField({ session: "기타", index: 1 }),
  기타2: memberSessionRequiredField({ session: "기타", index: 2 }),
  기타3: memberSessionRequiredField({ session: "기타", index: 3 }),
  베이스1: memberSessionRequiredField({ session: "베이스", index: 1 }),
  베이스2: memberSessionRequiredField({ session: "베이스", index: 2 }),
  드럼: memberSessionRequiredField({ session: "드럼", index: 1 }),
  신디1: memberSessionRequiredField({ session: "신디", index: 1 }),
  신디2: memberSessionRequiredField({ session: "신디", index: 2 }),
  현악기: memberSessionRequiredField({ session: "현악기", index: 1 }),
  관악기: memberSessionRequiredField({ session: "관악기", index: 1 })
})

export type SecondPageFormSchema = z.ZodObject<{
  [key: string]: z.ZodObject<{
    session: z.ZodString
    membersId: z.ZodArray<z.ZodNumber>
  }>
}>
