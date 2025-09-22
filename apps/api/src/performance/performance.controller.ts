import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe
} from "@nestjs/common"
import { PerformanceService } from "./performance.service"
import { CreatePerformanceDto } from "./dto/create-performance.dto"
import { UpdatePerformanceDto } from "./dto/update-performance.dto"
import { AccessTokenGuard } from "../auth/guards/access-token.guard"
import { AdminGuard } from "../auth/guards/admin.guard"
import { Public } from "../auth/decorators/public.decorator"

@Controller("performances")
@UseGuards(AccessTokenGuard)
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createPerformanceDto: CreatePerformanceDto) {
    return this.performanceService.create(createPerformanceDto)
  }

  @Get()
  @Public()
  findAll() {
    return this.performanceService.findAll()
  }

  @Get(":id/teams")
  @Public()
  findTeamsByPerformanceId(@Param("id", ParseIntPipe) id: number) {
    return this.performanceService.findTeamsByPerformanceId(id)
  }

  @Get(":id")
  @Public()
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.performanceService.findOne(id)
  }

  @Patch(":id")
  @UseGuards(AdminGuard)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePerformanceDto: UpdatePerformanceDto
  ) {
    return this.performanceService.update(id, updatePerformanceDto)
  }

  @Delete(":id")
  @UseGuards(AdminGuard)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.performanceService.remove(id)
  }
}
