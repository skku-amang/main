import { PartialType } from "@nestjs/mapped-types"
import { CreatePerformanceDto } from "./create-performance.dto"

export class UpdatePerformanceDto extends PartialType(CreatePerformanceDto) {}
