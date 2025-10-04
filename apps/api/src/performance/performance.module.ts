import { Module } from "@nestjs/common"
import { PerformanceService } from "./performance.service"
import { PerformanceController } from "./performance.controller"

@Module({
  controllers: [PerformanceController],
  providers: [PerformanceService]
})
export class PerformanceModule {}
