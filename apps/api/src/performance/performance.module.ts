import { Module } from "@nestjs/common"
import { PerformanceService } from "./performance.service"
import { PerformanceController } from "./performance.controller"
import { ObjectStorageModule } from "../object-storage/object-storage.module"

@Module({
  imports: [ObjectStorageModule],
  controllers: [PerformanceController],
  providers: [PerformanceService]
})
export class PerformanceModule {}
