import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards
} from "@nestjs/common"

import { Public } from "../auth/decorators/public.decorator"
import { AccessTokenGuard } from "../auth/guards/access-token.guard"
import { AdminGuard } from "../auth/guards/admin.guard"
import { CreateGenerationDto } from "./dto/create-generation.dto"
import { UpdateGenerationDto } from "./dto/update-generation.dto"
import { GenerationService } from "./generation.service"

@Controller("generations")
@UseGuards(AccessTokenGuard)
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createGenerationDto: CreateGenerationDto) {
    return this.generationService.create(createGenerationDto)
  }

  @Get()
  @Public()
  findAll() {
    return this.generationService.findAll()
  }

  @Get(":id")
  @Public()
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.generationService.findOne(id)
  }

  @Patch(":id")
  @UseGuards(AdminGuard)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateGenerationDto: UpdateGenerationDto
  ) {
    return this.generationService.update(id, updateGenerationDto)
  }

  @Delete(":id")
  @UseGuards(AdminGuard)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.generationService.remove(id)
  }
}
