import { z } from "zod"
import { EquipCategory } from "@repo/database"
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "../constants/file"

/**
 * @description 장비 생성 원본 Zod 스키마
 *
 * 프론트엔드에서 폼(FormData)을 만들기 전,
 * 원본 데이터(React state 등)를 검증할 때 사용됩니다. (텍스트 + 파일 포함)
 */
export const CreateEquipmentSchema = z.object({
  brand: z.string().min(1, "장비 브랜드 명은 필수입니다."),
  model: z.string().min(1, "장비 모델 명은 필수입니다."),
  category: z.nativeEnum(EquipCategory, {
    required_error: "장비 카테고리는 필수입니다."
  }),
  isAvailable: z.boolean().optional(),
  description: z.string().optional(),
  image: z
    .instanceof(File)
    .refine((file) => file.size < MAX_FILE_SIZE, {
      message: "File can't be larger than 20MB."
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: `파일 확장자는 ${ACCEPTED_IMAGE_TYPES.map((t) => t.replace("image/", "")).join(", ")} 만 가능합니다.`
    })
    .nullable()
    .optional()
})

/**
 * @description 백엔드 API 컨트롤러(DTO)용 Zod 스키마
 *
 * `FileInterceptor`에 의해 파일(`image`)이 분리된 후,
 * `req.body` (텍스트 필드)만을 검증하기 위해 사용됩니다.
 */
export const CreateEquipmentApiSchema = CreateEquipmentSchema.omit({
  image: true
})

/**
 * @description 장비 생성 타입 (프론트엔드용)
 */
export type CreateEquipment = z.infer<typeof CreateEquipmentSchema>
