export const PERFORMANCE_EVENTS = {
  CREATED: "performance.created"
} as const

export class PerformanceCreatedEvent {
  constructor(
    readonly performanceId: number,
    readonly actorId: number
  ) {}
}
