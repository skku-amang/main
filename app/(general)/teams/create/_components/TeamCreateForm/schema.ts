import { z } from "zod"

import { SessionName } from "@/types/Session"

const singleMemberSessionSchema = ({
  sessionName,
  index
}: {
  sessionName: SessionName
  index: number
}) =>
  z
    .object({
      sessionName: z
        .string({ required_error: "필수 항목" })
        .default(sessionName)
        .readonly(),
      index: z
        .number({ required_error: "필수 항목" })
        .default(index)
        .readonly(),
      required: z.boolean({ required_error: "필수 항목" }).default(false),
      memberId: z.number().optional()
    })
    .refine((data) => !data.required || data.memberId !== undefined, {
      message: "required가 true인 경우 memberId는 필수입니다.",
      path: ["memberId"]
    })
    .optional()

const memberSessions = {
  보컬1: singleMemberSessionSchema({ sessionName: "보컬", index: 1 }),
  보컬2: singleMemberSessionSchema({ sessionName: "보컬", index: 2 }),
  보컬3: singleMemberSessionSchema({ sessionName: "보컬", index: 3 }),
  기타1: singleMemberSessionSchema({ sessionName: "기타", index: 1 }),
  기타2: singleMemberSessionSchema({ sessionName: "기타", index: 2 }),
  기타3: singleMemberSessionSchema({ sessionName: "기타", index: 3 }),
  베이스1: singleMemberSessionSchema({ sessionName: "베이스", index: 1 }),
  베이스2: singleMemberSessionSchema({ sessionName: "베이스", index: 2 }),
  드럼: singleMemberSessionSchema({ sessionName: "드럼", index: 1 }),
  신디1: singleMemberSessionSchema({ sessionName: "신디", index: 1 }),
  신디2: singleMemberSessionSchema({ sessionName: "신디", index: 2 }),
  현악기: singleMemberSessionSchema({ sessionName: "현악기", index: 1 }),
  관악기: singleMemberSessionSchema({ sessionName: "관악기", index: 1 })
}

type MemberSessionSchema = {
  session: SessionName
  count: number
}
type Row = { [label: string]: MemberSessionSchema[] }
export const memberSessionStructure: Row = {
  보컬: [{ session: "보컬", count: 3 }],
  기타: [{ session: "기타", count: 3 }],
  "베이스 및 드럼": [
    { session: "베이스", count: 2 },
    { session: "드럼", count: 1 }
  ],
  신디: [{ session: "신디", count: 3 }],
  "그 외": [
    { session: "현악기", count: 1 },
    { session: "관악기", count: 1 }
  ]
}

export const basicInfoSchema = z.object({
  performanceId: z.number({ required_error: "필수 항목" }),
  songName: z
    .string({ required_error: "필수 항목" })
    .min(1, { message: "1글자 이상 입력해주세요" }),
  artistName: z
    .string({ required_error: "필수 항목" })
    .min(1, { message: "1글자 이상 입력해주세요" }),
  isFreshmenFixed: z.string({ required_error: "필수 항목" }),
  isSelfMade: z.string({ required_error: "필수 항목" }),
  description: z.string().optional()
})

export const memberSessionSchema = z.object({
  memberSessions: z.object(memberSessions)
})

const teamCreateFormSchema = basicInfoSchema.merge(memberSessionSchema)
export default teamCreateFormSchema
