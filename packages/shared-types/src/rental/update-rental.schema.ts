import { z } from "zod"
import { RentalSchema } from "./create-rental.schema"

/**
 * @description 대여 업데이트 Zod 스키마
 *
 * `RentalSchema`의 모든 필드를 '선택적(optional)'으로 만듭니다.
 * 프론트엔드에서 '수정 폼'의 원본 데이터를 검증할 때 사용됩니다.
 */
export const UpdateRentalSchema = RentalSchema.partial().refine(
  (data) => {
    if (data.startAt && data.endAt) {
      return data.startAt < data.endAt
    }
    return true
  },
  {
    message: "대여 종료 시간은 대여 시작 시간보다 뒤여야 합니다.",
    path: ["endAt"]
  }
)

/**
 * @description 장비 업데이트 타입 (프론트엔드용)
 */
export type UpdateRental = z.infer<typeof UpdateRentalSchema>
