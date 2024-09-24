import { z } from "zod"

import { memberSessionRequiredBaseSchema } from "@/app/(general)/teams/create/_components/TeamCreateForm/SecondPage/schema"

export const createDynamicSchema = (
  baseSchema: z.infer<typeof memberSessionRequiredBaseSchema>
) => {
  const dynamicShape: { [key: string]: z.ZodType<any> } = {}

  const sessionNameRequiredMemberCountMap = new Map<string, number>()
  Object.values(baseSchema.memberSessions).forEach((value) => {
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

  Object.values(baseSchema.memberSessions).forEach((value) => {
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
