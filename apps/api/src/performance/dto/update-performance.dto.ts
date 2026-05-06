import { createZodDto } from "nestjs-zod"
import { zPerformanceUpdate } from "@repo/api-client"

// Spec(packages/api-client/spec/v1/performance.yaml)에서 derive된 Zod schema 사용.
// 이전 hand-written @repo/shared-types/UpdatePerformanceApiSchema 대체.
export class UpdatePerformanceDto extends createZodDto(zPerformanceUpdate) {}
