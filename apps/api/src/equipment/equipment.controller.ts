import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile
} from "@nestjs/common"
import { EquipmentService } from "./equipment.service"
import { CreateEquipmentDto } from "./dto/create-equipment.dto"
import { UpdateEquipmentDto } from "./dto/update-equipment.dto"
import { AccessTokenGuard } from "../auth/guards/access-token.guard"
import { AdminGuard } from "../auth/guards/admin.guard"
import { Public } from "../auth/decorators/public.decorator"
import { FileInterceptor } from "@nestjs/platform-express"
import { optionalImageFileValidationPipe } from "../common/pipes/image-validation.pipe"

@Controller("equipment")
@UseGuards(AccessTokenGuard)
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor("image"))
  create(
    @Body() createEquipmentDto: CreateEquipmentDto,
    @UploadedFile(optionalImageFileValidationPipe)
    file?: Express.Multer.File
  ) {
    return this.equipmentService.create(createEquipmentDto, file)
  }

  @Get()
  @Public()
  findAll(@Query("type") type?: string) {
    return this.equipmentService.findAll(type)
  }

  @Get(":id")
  @Public()
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.equipmentService.findOne(id)
  }

  @Patch(":id")
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor("image"))
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
    @UploadedFile(optionalImageFileValidationPipe)
    file?: Express.Multer.File
  ) {
    return this.equipmentService.update(id, updateEquipmentDto, file)
  }

  @Delete(":id")
  @UseGuards(AdminGuard)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.equipmentService.remove(id)
  }
}
