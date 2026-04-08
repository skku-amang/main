import { Module } from "@nestjs/common"
import { EquipmentService } from "./equipment.service"
import { EquipmentController } from "./equipment.controller"
import { ObjectStorageModule } from "../object-storage/object-storage.module"

@Module({
  imports: [ObjectStorageModule],
  controllers: [EquipmentController],
  providers: [EquipmentService]
})
export class EquipmentModule {}
