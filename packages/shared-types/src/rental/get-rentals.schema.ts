import { z } from "zod"

export const GetRentalsQuerySchema = z.object({
  type: z.enum(["room", "item"]).optional(),
  equipmentId: z.coerce
    .number({ invalid_type_error: "장비 ID는 숫자여야 합니다." })
    .int("장비 아이디는 정수여야 합니다.")
    .positive()
    .optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional()
})

export type GetRentalQuery = z.infer<typeof GetRentalsQuerySchema>
