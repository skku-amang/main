import type { UpdatePerformance } from "@repo/shared-types"

export const PERFORMANCE_EVENTS = {
  CREATED: "performance.created",
  UPDATED: "performance.updated"
} as const

export class PerformanceCreatedEvent {
  constructor(
    readonly performanceId: number,
    readonly actorId: number
  ) {}
}

export class PerformanceUpdatedEvent {
  constructor(
    readonly performanceId: number,
    readonly changedFields: string[],
    readonly actorId: number
  ) {}
}

/** 알림을 보낼 만한 변경만. 설명·이미지는 제외 */
const NOTIFY_FIELDS = ["name", "startAt", "endAt", "location"] as const

type Existing = Record<(typeof NOTIFY_FIELDS)[number], unknown>

const normalize = (v: unknown) =>
  v instanceof Date ? v.getTime() : (v ?? null)

/** PATCH라 안 보낸 필드는 유지. 보낸 필드만 기존 값과 비교한다 */
export function changedPerformanceFields(
  existing: Existing,
  dto: UpdatePerformance
) {
  return NOTIFY_FIELDS.filter(
    (field) =>
      dto[field] !== undefined &&
      normalize(dto[field]) !== normalize(existing[field])
  )
}
