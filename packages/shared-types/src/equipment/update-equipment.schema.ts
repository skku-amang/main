import { z } from "zod"
import { CreateEquipmentSchema } from "./create-equipment.schema"

export const UpdateEquipmentSchema = CreateEquipmentSchema.partial()

/**
 * @description 백엔드 API 컨트롤러(DTO)용 장비 업데이트 스키마
 * Presigned URL 방식이므로 image도 문자열로 포함
 */
export const UpdateEquipmentApiSchema = UpdateEquipmentSchema

export type UpdateEquipment = z.infer<typeof UpdateEquipmentSchema>
