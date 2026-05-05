import { createZodDto } from "nestjs-zod"
import { zPerformanceCreate } from "@repo/api-client"

// Spec(packages/api-client/spec/v1/performance.yaml)에서 derive된 Zod schema 사용.
// 이전 hand-written @repo/shared-types/CreatePerformanceApiSchema 대체.
export class CreatePerformanceDto extends createZodDto(zPerformanceCreate) {}
