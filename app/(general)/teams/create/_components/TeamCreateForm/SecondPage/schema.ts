import { z } from "zod"

const memberSessionRequiredField = ({
  sessionName,
  index
}: {
  sessionName: string
  index: number
}) =>
  z.object({
    sessionName: z.string().default(sessionName).readonly(),
    index: z.number({ required_error: "필수 항목" }).default(index).readonly(),
    required: z.boolean({ required_error: "필수 항목" }).default(false)
  })

export const memberSessionRequiredBaseSchema = z.object({
  memberSessions: z.object({
    보컬1: memberSessionRequiredField({ sessionName: "보컬", index: 1 }),
    보컬2: memberSessionRequiredField({ sessionName: "보컬", index: 2 }),
    보컬3: memberSessionRequiredField({ sessionName: "보컬", index: 3 }),
    기타1: memberSessionRequiredField({ sessionName: "기타", index: 1 }),
    기타2: memberSessionRequiredField({ sessionName: "기타", index: 2 }),
    기타3: memberSessionRequiredField({ sessionName: "기타", index: 3 }),
    베이스1: memberSessionRequiredField({ sessionName: "베이스", index: 1 }),
    베이스2: memberSessionRequiredField({ sessionName: "베이스", index: 2 }),
    드럼: memberSessionRequiredField({ sessionName: "드럼", index: 1 }),
    신디1: memberSessionRequiredField({ sessionName: "신디", index: 1 }),
    신디2: memberSessionRequiredField({ sessionName: "신디", index: 2 }),
    신디3: memberSessionRequiredField({ sessionName: "신디", index: 3 }),
    현악기: memberSessionRequiredField({ sessionName: "현악기", index: 1 }),
    관악기: memberSessionRequiredField({ sessionName: "관악기", index: 1 })
  })
})

export type SecondPageFormSchema = z.ZodObject<{
  [key: string]: z.ZodObject<{
    session: z.ZodString
    members: z.ZodArray<z.ZodNumber>
    requiredMemberCount: z.ZodNumber
  }>
}>
