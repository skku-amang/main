import { Module } from "@nestjs/common"
import { EquipmentService } from "./equipment.service"
import { EquipmentController } from "./equipment.controller"

@Module({
  controllers: [EquipmentController],
  providers: [EquipmentService]
})
export class EquipmentModule {}
