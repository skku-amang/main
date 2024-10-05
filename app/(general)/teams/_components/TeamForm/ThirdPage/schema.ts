import { z } from "zod"

import { memberSessionRequiredBaseSchema } from "@/app/(general)/teams/_components/TeamForm/SecondPage/schema"

function generateNullUserIdArray(length: number): null[] {
  return Array.from({ length }, () => null)
}

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
          .default(generateNullUserIdArray(requiredMemberCount))
      })
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
    [key: string]: { session: string; membersId: (number | null)[] }
  } = {}

  Object.values(baseSchema).forEach((value) => {
    const { required, session, member, index } = value
    if (!required) return
    if (!formDefaultValues[session]) {
      formDefaultValues[session] = {
        session,
        membersId: []
      }
    }
    formDefaultValues[session].membersId[index - 1] = member
  })

  return formDefaultValues
}
