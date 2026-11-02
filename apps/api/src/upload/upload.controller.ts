import { Body, Controller, Post, UseGuards } from "@nestjs/common"
import { AccessTokenGuard } from "../auth/guards/access-token.guard"
import { ObjectStorageService } from "../object-storage/object-storage.service"
import { PresignedUrlRequestDto } from "./dto/presigned-url.dto"
import { RecordingPresignedUrlRequestDto } from "./dto/recording-presigned-url.dto"

@Controller("uploads")
@UseGuards(AccessTokenGuard)
export class UploadController {
  constructor(private readonly objectStorageService: ObjectStorageService) {}

  @Post("presigned-url")
  async getPresignedUrl(@Body() dto: PresignedUrlRequestDto) {
    return this.objectStorageService.getPresignedUploadUrl(
      "images",
      dto.filename,
      dto.contentType
    )
  }

  @Post("presigned-url/recording")
  async getRecordingPresignedUrl(@Body() dto: RecordingPresignedUrlRequestDto) {
    return this.objectStorageService.getPresignedUploadUrl(
      "recordings",
      dto.filename,
      dto.contentType,
      dto.size
    )
  }
}
