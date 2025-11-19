import { z } from "zod"
import { CreateEquipmentSchema } from "./create-equipment.schema"

/**
 * @description 장비 업데이트 Zod 스키마
 *
 * `CreateEquipmentSchema`의 모든 필드를 '선택적(optional)'으로 만듭니다.
 * 프론트엔드에서 '수정 폼'의 원본 데이터를 검증할 때 사용됩니다.
 */
export const UpdateEquipmentSchema = CreateEquipmentSchema.partial()

/**
 * @description 백엔드 API 컨트롤러(DTO)용 장비 업데이트 스키마
 *
 * `UpdateEquipmentSchema`에서 `image` 필드를 제외합니다.
 * 백엔드 `PATCH` 요청의 `req.body` (텍스트 필드)만을 검증하기 위해 사용됩니다.
 */
export const UpdateEquipmentApiSchema = UpdateEquipmentSchema.omit({
  image: true
})

/**
 * @description 장비 업데이트 타입 (프론트엔드용)
 */
export type UpdateEquipment = z.infer<typeof UpdateEquipmentSchema>
