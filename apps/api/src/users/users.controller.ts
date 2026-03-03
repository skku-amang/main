import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Param,
  ParseIntPipe
} from "@nestjs/common"
import { AccessTokenGuard } from "../auth/guards/access-token.guard"
import { UsersService } from "./users.service"
import { Public } from "../auth/decorators/public.decorator"
import { AdminGuard } from "src/auth/guards/admin.guard"
import { CreateUserDto } from "./dto/create-user.dto"
import { UpdateUserDto } from "./dto/update-user.dto"

@Controller("users")
@UseGuards(AccessTokenGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @Public()
  findAll() {
    return this.userService.findAll()
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  @Patch(":id")
  @UseGuards(AdminGuard)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.userService.updateUser(id, updateUserDto)
  }
}
