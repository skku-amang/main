import { z } from "zod"

const basicInfoSchema = z.object({
  performanceId: z.number({ required_error: "필수 항목" }),
  songName: z
    .string({ required_error: "필수 항목" })
    .min(1, { message: "1글자 이상 입력해주세요" }),
  artistName: z
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

const memberSessionRequiredSchema = z.object({
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

export const firstPageSchema = basicInfoSchema.merge(
  memberSessionRequiredSchema
)

const createDynamicSchema = (baseSchema: z.ZodObject<any>) => {
  const shape = baseSchema.shape
  const dynamicShape: any = {}

  const sessionNameSet = new Set<string>()
  for (const key in shape) {
    if (Object.hasOwn(shape, key)) {
      const sessionName = shape[key].shape.sessionName
      sessionNameSet.add(sessionName)
    }
  }

  for (const sessionName in sessionNameSet) {
    dynamicShape[sessionName] = z
      .object({
        members: z.array(z.number()),
        requiredMemberCount: z.number()
      })
      .refine(
        (data) => {
          // 멤버 중복 체크
          const memberSet = new Set<number>()
          for (const member of data.members) {
            if (memberSet.has(member)) {
              return false
            }
            memberSet.add(member)
          }
        },
        {
          message: "멤버가 중복되었습니다"
        }
      )
  }

  return z.object(dynamicShape)
}

export const memberSessionInitSchema = createDynamicSchema(
  memberSessionRequiredSchema
)
