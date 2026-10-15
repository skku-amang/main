import { z } from "zod"

/**
 * HTML 태그 패턴 (XSS 방지)
 * <script>, <img onerror=...>, <div onclick=...> 등을 차단
 */
const HTML_TAG_PATTERN = /<[^>]*>/

/**
 * 안전한 문자열 Zod 스키마 생성
 * - trim: 앞뒤 공백 제거
 * - min(1): 빈 문자열 차단
 * - max: 최대 길이 제한 (기본 200자)
 * - HTML 태그 차단
 */
export function safeString(options: { max?: number; message?: string } = {}) {
  const { max = 200, message = "이 항목은 필수입니다." } = options

  return z
    .string()
    .trim()
    .min(1, { message })
    .max(max, { message: `최대 ${max}자까지 입력할 수 있습니다.` })
    .refine((val) => !HTML_TAG_PATTERN.test(val), {
      message: "HTML 태그는 사용할 수 없습니다."
    })
}

/**
 * 안전한 optional 문자열 Zod 스키마 생성 (bio 등 폼 선택 필드용)
 * - 값이 있으면 trim + max + HTML 태그 검증 적용
 * - 빈 문자열 또는 미입력 허용
 */
export function safeOptionalString(options: { max?: number } = {}) {
  const { max = 200 } = options

  return z
    .string()
    .trim()
    .max(max, { message: `최대 ${max}자까지 입력할 수 있습니다.` })
    .refine((val) => !HTML_TAG_PATTERN.test(val), {
      message: "HTML 태그는 사용할 수 없습니다."
    })
    .optional()
}

/**
 * 안전한 nullable 문자열 Zod 스키마 생성 (description, location 등 API 선택 필드용)
 * - 값이 있으면 trim + max + HTML 태그 검증 적용
 * - null 또는 미입력 허용
 */
export function safeNullableString(options: { max?: number } = {}) {
  const { max = 500 } = options

  return z
    .string()
    .trim()
    .max(max, { message: `최대 ${max}자까지 입력할 수 있습니다.` })
    .refine((val) => !HTML_TAG_PATTERN.test(val), {
      message: "HTML 태그는 사용할 수 없습니다."
    })
    .nullable()
    .optional()
}
