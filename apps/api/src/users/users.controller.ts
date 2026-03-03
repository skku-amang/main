import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common"
import { AccessTokenGuard } from "../auth/guards/access-token.guard"
import { UsersService } from "./users.service"
import { Public } from "../auth/decorators/public.decorator"
import { AdminGuard } from "src/auth/guards/admin.guard"
import { CreateUserDto } from "../users/dto/create-user.dto"

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
}
