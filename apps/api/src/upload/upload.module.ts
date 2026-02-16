import { Module } from "@nestjs/common"
import { UploadController } from "./upload.controller"
import { ObjectStorageModule } from "../object-storage/object-storage.module"

@Module({
  imports: [ObjectStorageModule],
  controllers: [UploadController]
})
export class UploadModule {}
