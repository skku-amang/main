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
import { CreateSessionDto } from "./dto/create-session.dto"
import { UpdateSessionDto } from "./dto/update-session.dto"
import { SessionService } from "./session.service"

@Controller("sessions")
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
