import { z } from "zod"

const basicInfoSchema = z.object({
  performanceId: z.number({ required_error: "필수 항목" }),
  songName: z
    .string({ required_error: "필수 항목" })
    .min(1, { message: "1글자 이상 입력해주세요" }),
  songArtist: z
    .string({ required_error: "필수 항목" })
    .min(1, { message: "1글자 이상 입력해주세요" }),
  isFreshmenFixed: z.boolean().default(false).optional(),
  isSelfMade: z.boolean().default(false).optional(),
  description: z.string().optional()
})

export const memberSessionRequiredField = ({
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
const memberSessionRequiredSchema = z.object({
  memberSessions: memberSessionRequiredBaseSchema
})

export const firstPageSchema = basicInfoSchema.merge(
  memberSessionRequiredSchema
)

export type SecondPageFormSchema = z.ZodObject<{
  [key: string]: z.ZodObject<{
    session: z.ZodString
    members: z.ZodArray<z.ZodNumber>
    requiredMemberCount: z.ZodNumber
  }>
}>

export const createDynamicSchema = (
  baseSchema: z.infer<typeof memberSessionRequiredBaseSchema>
) => {
  const dynamicShape: { [key: string]: z.ZodType<any> } = {}

  const sessionNameRequiredMemberCountMap = new Map<string, number>()
  Object.values(baseSchema).forEach((value) => {
    if (!value.required) {
      return
    }
    const requiredMemberCount = sessionNameRequiredMemberCountMap.get(
      value.sessionName
    )

    if (requiredMemberCount) {
      sessionNameRequiredMemberCountMap.set(
        value.sessionName,
        requiredMemberCount + 1
      )
    } else {
      sessionNameRequiredMemberCountMap.set(value.sessionName, 1)
    }
  })

  sessionNameRequiredMemberCountMap.forEach(
    (requiredMemberCount, sessionName) => {
      dynamicShape[sessionName] = z
        .object({
          session: z.string().default(sessionName).readonly(),
          members: z.array(z.union([z.number(), z.null()])).default([]),
          requiredMemberCount: z.number().default(requiredMemberCount)
        })
        .refine(
          (data) => {
            // 멤버 중복 체크
            const memberSet = new Set<number>()
            for (const member of data.members) {
              if (!member) {
                continue
              }
              if (memberSet.has(member)) {
                return false
              }
              memberSet.add(member)
            }
            return true
          },
          {
            message: "멤버가 중복되었습니다"
          }
        )
        .optional()
    }
  )

  return z.object(dynamicShape)
}

export function getFormDefaultValeus(
  baseSchema: z.infer<typeof memberSessionRequiredBaseSchema>
) {
  const formDefaultValues: { [key: string]: z.infer<any> } = {}

  Object.values(baseSchema).forEach((value) => {
    if (!value.required) {
      return
    }
    if (!formDefaultValues[value.sessionName]) {
      formDefaultValues[value.sessionName] = {
        session: value.sessionName,
        members: [],
        requiredMemberCount: 1
      }
    } else {
      formDefaultValues[value.sessionName].requiredMemberCount += 1
    }
  })

  Object.values(formDefaultValues).forEach((value) => {
    value.members = new Array(value.requiredMemberCount).fill(null)
  })

  return formDefaultValues
}
