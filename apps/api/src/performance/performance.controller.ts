import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete
} from "@nestjs/common"
import { PerformanceService } from "./performance.service"
import { CreatePerformanceDto } from "./dto/create-performance.dto"
import { UpdatePerformanceDto } from "./dto/update-performance.dto"

@Controller("performances")
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Post()
  create(@Body() createPerformanceDto: CreatePerformanceDto) {
    return this.performanceService.create(createPerformanceDto)
  }

  @Get()
  findAll() {
    return this.performanceService.findAll()
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.performanceService.findOne(+id)
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updatePerformanceDto: UpdatePerformanceDto
  ) {
    return this.performanceService.update(+id, updatePerformanceDto)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.performanceService.remove(+id)
  }
}
