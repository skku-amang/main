import { z } from "zod"
import { EquipCategory } from "@repo/database/enums"

export const CreateEquipmentSchema = z.object({
  brand: z.string().min(1, "장비 브랜드 명은 필수입니다."),
  model: z.string().min(1, "장비 모델 명은 필수입니다."),
  category: z.nativeEnum(EquipCategory, {
    required_error: "장비 카테고리는 필수입니다."
  }),
  isAvailable: z.boolean().optional(),
  description: z.string().optional(),
  image: z.string().url().nullable().optional()
})

/**
 * @description 백엔드 API 컨트롤러(DTO)용 Zod 스키마
 * Presigned URL 방식이므로 image도 문자열로 포함
 */
export const CreateEquipmentApiSchema = CreateEquipmentSchema

export type CreateEquipment = z.infer<typeof CreateEquipmentSchema>
