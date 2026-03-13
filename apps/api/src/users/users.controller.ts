import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
  Delete,
  Req
} from "@nestjs/common"
import { AccessTokenGuard } from "../auth/guards/access-token.guard"
import { UsersService } from "./users.service"
import { Public } from "../auth/decorators/public.decorator"
import { AdminGuard } from "../auth/guards/admin.guard"
import { CreateUserDto } from "./dto/create-user.dto"
import { UpdateUserDto } from "./dto/update-user.dto"
import { Request } from "express"
import { JwtPayload } from "@repo/shared-types"
import { UpdatePasswordDto } from "./dto/update-password.dto"
import { UpdateProfileDto } from "./dto/update-profile.dto"

@Controller("users")
@UseGuards(AccessTokenGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @Public()
  findAll() {
    return this.userService.findAll()
  }

  @Get("admin")
  @UseGuards(AdminGuard)
  findAllForAdmin() {
    return this.userService.findAllForAdmin()
  }

  @Get(":id")
  @Public()
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.userService.findOne(id)
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  @Patch("me")
  async updateProfile(
    @Req() req: Request,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    const user = req.user as JwtPayload
    const { sub: userId } = user

    return this.userService.updateProfile(userId, updateProfileDto)
  }

  @Patch("me/password")
  async updatePassword(
    @Req() req: Request,
    @Body() updatePasswordDto: UpdatePasswordDto
  ) {
    const user = req.user as JwtPayload
    const { sub: userId } = user

    return this.userService.updatePassword(userId, updatePasswordDto)
  }

  @Patch(":id")
  @UseGuards(AdminGuard)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.userService.updateUser(id, updateUserDto)
  }

  @Delete(":id")
  @UseGuards(AdminGuard)
  async deleteUser(@Param("id", ParseIntPipe) id: number) {
    return this.userService.deleteUser(id)
  }
}
