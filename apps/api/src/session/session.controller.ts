import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards
} from "@nestjs/common"
import { SessionService } from "./session.service"
import { CreateSessionDto, UpdateSessionDto } from "@repo/shared-types"
import { AccessTokenGuard } from "../auth/guards/access-token.guard"
import { AdminGuard } from "../auth/guards/admin.guard"
import { Public } from "../auth/decorators/public.decorator"

@Controller("session")
@UseGuards(AccessTokenGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionService.create(createSessionDto)
  }

  @Get()
  @Public()
  findAll() {
    return this.sessionService.findAll()
  }

  @Get(":id")
  @Public()
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.sessionService.findOne(id)
  }

  @Patch(":id")
  @UseGuards(AdminGuard)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateSessionDto: UpdateSessionDto
  ) {
    return this.sessionService.update(id, updateSessionDto)
  }

  @Delete(":id")
  @UseGuards(AdminGuard)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.sessionService.remove(id)
  }
}
