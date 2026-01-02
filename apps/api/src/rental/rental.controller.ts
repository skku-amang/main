import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query
} from "@nestjs/common"
import { RentalService } from "./rental.service"
import { CreateRentalDto } from "./dto/create-rental.dto"
import { UpdateRentalDto } from "./dto/update-rental.dto"
import { GetRentalQueryDto } from "./dto/get-rentals-query.dto"
import { AccessTokenGuard } from "../auth/guards/access-token.guard"
import { Public } from "../auth/decorators/public.decorator"

@Controller("rentals")
@UseGuards(AccessTokenGuard)
export class RentalController {
  constructor(private readonly rentalService: RentalService) {}

  @Post()
  async create(createRentalDto: CreateRentalDto) {
    return this.rentalService.create(createRentalDto)
  }

  @Get()
  @Public()
  findAll(@Query() query: GetRentalQueryDto) {
    return this.rentalService.findAll(
      query.type,
      query.equipmentId,
      query.from,
      query.to
    )
  }

  @Get(":id")
  @Public()
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.rentalService.findOne(id)
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateRentalDto: UpdateRentalDto
  ) {
    return this.rentalService.update(id, updateRentalDto)
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.rentalService.remove(id)
  }
}
