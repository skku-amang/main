import { z } from "zod"

import { memberSessionRequiredBaseSchema } from "@/app/(general)/teams/_components/TeamForm/SecondPage/schema"

function createBlankUserIdArray(length: number): null[] {
  return Array.from({ length }, () => null)
}

const thirdPageMemberSessionField = z.record(
  z.string(),
  z
    .array(z.number())
    .refine(
      (data) => {
        // 멤버 중복 체크
        return new Set<number>(data).size === data.length
      },
      {
        message: "멤버가 중복되었습니다"
      }
    )
    .default([])
)

export const createDynamicSchema = (
  baseSchema: z.infer<typeof memberSessionRequiredBaseSchema>
) => {
  const dynamicShape: { [key: string]: z.ZodType<any> } = {}

  // required === true인 필드에 대해서만
  const sessionNameRequiredMemberCountMap = new Map<string, number>()
  Object.values(baseSchema).forEach((value) => {
    if (!value.required) return
    const requiredMemberCount = sessionNameRequiredMemberCountMap.get(
      value.session
    )

    if (requiredMemberCount) {
      sessionNameRequiredMemberCountMap.set(
        value.session,
        requiredMemberCount + 1
      )
    } else {
      sessionNameRequiredMemberCountMap.set(value.session, 1)
    }
  })

  sessionNameRequiredMemberCountMap.forEach((requiredMemberCount, session) => {
    dynamicShape[session] = z
      .object({
        session: z.string().default(session).readonly(),
        membersId: z
          .array(z.union([z.number(), z.null()]))
          .default(createBlankUserIdArray(requiredMemberCount))
      })
      .refine(
        (data) => {
          // 멤버 중복 체크
          const dataWithoutBlankUserId = data.membersId.filter(
            (memberId) => memberId !== null
          )
          return (
            new Set<number>(dataWithoutBlankUserId).size ===
            dataWithoutBlankUserId.length
          )
        },
        {
          message: "멤버가 중복되었습니다"
        }
      )
      .optional()
  })

  return z.object(dynamicShape)
}

/**
 * baseSchema를 참조하여 유저 선택 폼의 디폴트 값을 동적으로 생성합니다.
 * @example
 * ```Typescript
 * const baseSchema = {
 *  보컬1: { session: "보컬", index: 1, required: true },
 *  보컬2: { session: "보컬", index: 2, required: true },
 *  보컬3: { session: "보컬", index: 3, required: false },
 *
 *  기타1: { session: "기타", index: 1, required: true },
 *  기타2: { session: "기타", index: 2, required: false },
 *  기타3: { session: "기타", index: 3, required: false },
 * }
 *
 * const defaultValuesForThirdPage = getFormDefaultValeus(baseSchema)
 * console.log(defaultValuesForThirdPage)
 * {
 *  보컬: [0, 0],
 *  기타: [0]
 * }
 * ```
 */
export function getFormDefaultValeus(
  baseSchema: z.infer<typeof memberSessionRequiredBaseSchema>
): z.infer<ReturnType<typeof createDynamicSchema>> {
  const formDefaultValues: {
    [key: string]: { session: string; membersId: number | null[] }
  } = {}

  // required === true인 필드에 대해서만
  const sessionNameRequiredMemberCountMap = new Map<string, number>()
  Object.values(baseSchema).forEach((value) => {
    if (!value.required) return
    const requiredMemberCount = sessionNameRequiredMemberCountMap.get(
      value.session
    )

    if (requiredMemberCount) {
      sessionNameRequiredMemberCountMap.set(
        value.session,
        requiredMemberCount + 1
      )
    } else {
      sessionNameRequiredMemberCountMap.set(value.session, 1)
    }
  })

  sessionNameRequiredMemberCountMap.forEach((requiredMemberCount, session) => {
    formDefaultValues[session] = {
      session,
      membersId: createBlankUserIdArray(requiredMemberCount)
    }
    // z
    //   .object({
    //     session: z.string().default(session).readonly(),
    //     membersId: z
    //       .array(z.number().default(BLANK_USER_ID))
    //       .default(createBlankUserIdArray(requiredMemberCount))
    //   })
    //   .refine(
    //     (data) => {
    //       // 멤버 중복 체크
    //       return new Set<number>(data.membersId).size === data.membersId.length
    //     },
    //     {
    //       message: "멤버가 중복되었습니다"
    //     }
    //   )
    //   .optional()
  })
  console.log("formDefaultValues:", formDefaultValues)
  return formDefaultValues
}
