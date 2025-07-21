import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards
} from "@nestjs/common"
import { GenerationService } from "./generation.service"
import { CreateGenerationDto, UpdateGenerationDto } from "shared-types"
import { AccessTokenGuard } from "../auth/guards/access-token.guard"
import { AdminGuard } from "../auth/guards/admin.guard"
import { Public } from "../auth/decorators/public.decorator"

@Controller("generation")
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
  findOne(@Param("id") id: number) {
    return this.generationService.findOne(id)
  }

  @Patch(":id")
  @UseGuards(AdminGuard)
  update(
    @Param("id") id: number,
    @Body() updateGenerationDto: UpdateGenerationDto
  ) {
    return this.generationService.update(id, updateGenerationDto)
  }

  @Delete(":id")
  @UseGuards(AdminGuard)
  remove(@Param("id") id: number) {
    return this.generationService.remove(id)
  }
}
