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
  Query
} from "@nestjs/common"
import { EquipmentService } from "./equipment.service"
import { CreateEquipmentDto } from "./dto/create-equipment.dto"
import { UpdateEquipmentDto } from "./dto/update-equipment.dto"
import { AccessTokenGuard } from "../auth/guards/access-token.guard"
import { AdminGuard } from "../auth/guards/admin.guard"
import { Public } from "../auth/decorators/public.decorator"

@Controller("equipment")
@UseGuards(AccessTokenGuard)
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createEquipmentDto: CreateEquipmentDto) {
    return this.equipmentService.create(createEquipmentDto)
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
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateEquipmentDto: UpdateEquipmentDto
  ) {
    return this.equipmentService.update(id, updateEquipmentDto)
  }

  @Delete(":id")
  @UseGuards(AdminGuard)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.equipmentService.remove(id)
  }
}
