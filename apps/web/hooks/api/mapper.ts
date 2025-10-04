/* eslint-disable @typescript-eslint/no-explicit-any */
import { Performance, Session, User } from "@repo/shared-types"

/**
 * 필드별 변환 함수 타입 정의
 */
type FieldTransformer<TInput = any, TOutput = any> = (value: TInput) => TOutput

/**
 * HTTP JSON 변환으로 인해 변경된 타입을 나타내는 타입
 * Date → string, 기타 타입은 그대로 유지
 */
type SerializedType<T> = T extends Date
  ? string
  : T extends Date | undefined
    ? string | undefined
    : T extends Date | null
      ? string | null
      : T extends Date | null | undefined
        ? string | null | undefined
        : T

/**
 * 전체 객체에 대해 직렬화된 타입으로 변환
 */
type Serialized<T> = {
  [K in keyof T]: SerializedType<T[K]>
}

/**
 * 변환 설정을 기반으로 특정 필드만 변환된 타입
 */
type TransformResult<TConfig> = {
  [K in keyof TConfig]: TConfig[K] extends FieldTransformer<any, infer TOutput>
    ? TOutput
    : never
}

/**
 * 원본 타입 + 변환된 필드 = 최종 결과 타입
 * 원본 타입의 모든 필드를 유지하면서, 변환 설정이 있는 필드는 변환된 타입으로 오버라이드
 */
type MapperResult<TOriginal, TConfig> = Serialized<TOriginal> &
  TransformResult<TConfig>

/**
 * 기본 변환 함수들
 */
export const FIELD_TRANSFORMERS = {
  // Date 변환
  toDate: (value: string): Date => new Date(value),
  toOptionalDate: (value?: string): Date | undefined =>
    value ? new Date(value) : undefined,
  toNullableDate: (value?: string | null): Date | null =>
    value ? new Date(value) : null,

  // Number 변환
  toNumber: (value: string): number => Number(value),
  toOptionalNumber: (value?: string): number | undefined =>
    value !== undefined ? Number(value) : undefined,

  // Boolean 변환
  toBoolean: (value: string): boolean => value === "true",
  toOptionalBoolean: (value?: string): boolean | undefined =>
    value !== undefined ? value === "true" : undefined,

  // Array 변환
  parseJsonArray: <T>(value: string): T[] => JSON.parse(value),
  parseOptionalJsonArray: <T>(value?: string): T[] | undefined =>
    value ? JSON.parse(value) : undefined,

  // Object 변환
  parseJsonObject: <T>(value: string): T => JSON.parse(value),
  parseOptionalJsonObject: <T>(value?: string): T | undefined =>
    value ? JSON.parse(value) : undefined,

  // String 변환 (기본값, 변환 없음)
  toString: (value: any): string => value,

  // 중첩 객체 매핑
  mapNested:
    <TInput, TOutput>(mapper: (input: TInput) => TOutput) =>
    (value: TInput): TOutput =>
      mapper(value),
  mapOptionalNested:
    <TInput, TOutput>(mapper: (input: TInput) => TOutput) =>
    (value?: TInput): TOutput | undefined =>
      value ? mapper(value) : undefined,
  mapNestedArray:
    <TInput, TOutput>(mapper: (input: TInput) => TOutput) =>
    (value: TInput[]): TOutput[] =>
      value.map(mapper)
} as const

/**
 * 각 모델별 변환 설정 - 변환이 필요한 필드만 정의
 */
export const TRANSFORM_CONFIGS = {
  performance: {
    startAt: FIELD_TRANSFORMERS.toNullableDate,
    endAt: FIELD_TRANSFORMERS.toNullableDate,
    createdAt: FIELD_TRANSFORMERS.toDate,
    updatedAt: FIELD_TRANSFORMERS.toDate
  },

  user: {
    createdAt: FIELD_TRANSFORMERS.toDate,
    updatedAt: FIELD_TRANSFORMERS.toDate
  },

  session: {
    createdAt: FIELD_TRANSFORMERS.toDate,
    updatedAt: FIELD_TRANSFORMERS.toDate
  }
} as const

/**
 * 설정 기반 범용 매퍼 생성 함수
 * 원본 타입의 모든 필드 + 변환된 필드 = 완전한 타입
 */
function createConfigBasedMapper<
  TOriginal,
  TConfig extends Record<string, FieldTransformer>
>(
  transformConfig: TConfig,
  debugMode: boolean = process.env.NODE_ENV === "development"
): (rawData: any) => MapperResult<TOriginal, TConfig> {
  return function mapWithConfig(
    rawData: any // any로 변경하여 유연성 확보
  ): MapperResult<TOriginal, TConfig> {
    // 원본 데이터의 모든 필드를 복사하여 시작
    const result = { ...rawData } as any

    if (debugMode) {
      console.group("🔄 Data Transform")
      console.log("Raw data:", rawData)
      console.log("Transform config keys:", Object.keys(transformConfig))
    }

    // 설정된 변환 규칙만 적용 (설정에 없는 필드는 원본 그대로 유지)
    Object.entries(transformConfig).forEach(([fieldName, transformer]) => {
      if (fieldName in result && transformer) {
        try {
          const originalValue = result[fieldName]
          result[fieldName] = transformer(result[fieldName])

          if (debugMode && originalValue !== result[fieldName]) {
            console.log(
              `📝 ${fieldName}:`,
              originalValue,
              "→",
              result[fieldName]
            )
          }
        } catch (error) {
          console.warn(`Failed to transform field '${fieldName}':`, error)
          // 변환 실패 시 원본 값 유지
        }
      }
    })

    if (debugMode) {
      console.log("All result keys:", Object.keys(result))
      console.log("Final result:", result)
      console.groupEnd()
    }

    return result as MapperResult<TOriginal, TConfig>
  }
}

/**
 * 배열용 매퍼 생성 함수
 */
function createArrayConfigBasedMapper<
  TOriginal,
  TConfig extends Record<string, FieldTransformer>
>(
  transformConfig: TConfig,
  debugMode: boolean = process.env.NODE_ENV === "development"
): (rawArray: any[]) => MapperResult<TOriginal, TConfig>[] {
  const singleMapper = createConfigBasedMapper<TOriginal, TConfig>(
    transformConfig,
    false
  )

  return function mapArrayWithConfig(
    rawArray: any[] // any로 변경
  ): MapperResult<TOriginal, TConfig>[] {
    if (debugMode) {
      console.group(`🔄 Array Transform (${rawArray.length} items)`)
      console.log("Raw array:", rawArray)
    }

    const result = rawArray.map(singleMapper)

    if (debugMode) {
      console.log("Transformed array:", result)
      console.groupEnd()
    }

    return result
  }
}

// 각 모델별 매퍼 생성 - 이제 완전한 타입을 반환합니다
export const mapPerformance = createConfigBasedMapper<
  Performance,
  typeof TRANSFORM_CONFIGS.performance
>(TRANSFORM_CONFIGS.performance)

export const mapPerformances = createArrayConfigBasedMapper<
  Performance,
  typeof TRANSFORM_CONFIGS.performance
>(TRANSFORM_CONFIGS.performance)

export const mapUser = createConfigBasedMapper<
  User,
  typeof TRANSFORM_CONFIGS.user
>(TRANSFORM_CONFIGS.user)

export const mapUsers = createArrayConfigBasedMapper<
  User,
  typeof TRANSFORM_CONFIGS.user
>(TRANSFORM_CONFIGS.user)

export const mapSession = createConfigBasedMapper<
  Session,
  typeof TRANSFORM_CONFIGS.session
>(TRANSFORM_CONFIGS.session)

export const mapSessions = createArrayConfigBasedMapper<
  Session,
  typeof TRANSFORM_CONFIGS.session
>(TRANSFORM_CONFIGS.session)

// 타입 테스트 (개발 시 확인용)
type TestPerformance = MapperResult<
  Performance,
  typeof TRANSFORM_CONFIGS.performance
>
// TestPerformance는 다음과 같습니다:
// {
//   id: number,              // 원본 유지
//   name: string,            // 원본 유지
//   description: string,     // 원본 유지
//   location: string,        // 원본 유지
//   posterImage: string,     // 원본 유지
//   startAt: Date | null,    // string → Date로 변환됨
//   endAt: Date | null,      // string → Date로 변환됨
//   createdAt: Date,         // string → Date로 변환됨
//   updatedAt: Date,         // string → Date로 변환됨
//   generationId: number     // 원본 유지
// }
