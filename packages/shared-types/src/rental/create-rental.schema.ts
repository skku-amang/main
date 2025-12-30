import { z } from "zod"

/**
 * @description 대여 기록 생성 Zod 스키마
 * 장비 ID와 대여 명, 대여 시작 시간 및 종료 시간과 함께 대여하는 유저를 포함합니다.
 */
export const CreateRentalSchema = z
  .object({
    equipmentId: z
      .number({ invalid_type_error: "장비 ID는 숫자여야 합니다." })
      .int("장비 아이디는 정수여야 합니다.")
      .positive(),
    title: z.string().min(1, "장비 대여 명은 필수입니다."),
    startAt: z.coerce.date({
      required_error: "대여 시작 시간은 필수입니다."
    }),
    endAt: z.coerce.date({
      invalid_type_error: "대여 종료 시간은 필수입니다."
    }),
    userIds: z
      .array(z.number().int().positive())
      .min(0)
      .refine((users) => new Set(users).size === users.length, {
        message: "중복된 유저 ID가 포함되어 있습니다."
      })
      .optional()
  })
  .refine((data) => data.startAt < data.endAt, {
    message: "대여 종료 시간은 대여 시작 시간보다 뒤여야 합니다.",
    path: ["endAt"]
  })

/**
 * @description 대여 기록 생성 타입 (프론트엔드용)
 */
export type CreateRental = z.infer<typeof CreateRentalSchema>
