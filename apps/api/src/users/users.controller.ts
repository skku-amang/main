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
  HttpCode,
  HttpStatus,
  Req
} from "@nestjs/common"
import { ConflictError, NotFoundError } from "@repo/api-client"
import { AccessTokenGuard } from "../auth/guards/access-token.guard"
import { UsersService } from "./users.service"
import { AdminGuard } from "../auth/guards/admin.guard"
import { CreateUserDto } from "./dto/create-user.dto"
import { UpdateUserDto } from "./dto/update-user.dto"
import { Request } from "express"
import { JwtPayload } from "@repo/shared-types"
import { UpdatePasswordDto } from "./dto/update-password.dto"
import { UpdateProfileDto } from "./dto/update-profile.dto"
import { EmailCodeService } from "../email-verification/email-code.service"
import { EmailCodeConfirmDto } from "../email-verification/email-verification.dto"

@Controller("users")
@UseGuards(AccessTokenGuard)
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly emailCodeService: EmailCodeService
  ) {}

  @Get()
  findAll() {
    return this.userService.findAll()
  }

  @Get("admin")
  @UseGuards(AdminGuard)
  findAllForAdmin() {
    return this.userService.findAllForAdmin()
  }

  @Get("admin/pending")
  @UseGuards(AdminGuard)
  findPendingUsers() {
    return this.userService.findPendingUsers()
  }

  @Get(":id/profile")
  getProfile(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    const user = req.user as JwtPayload
    return this.userService.getProfile(id, user.sub)
  }

  @Get(":id")
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

  @Post("me/email-verification")
  @HttpCode(HttpStatus.OK)
  async requestEmailVerification(@Req() req: Request) {
    const { email, emailVerifiedAt } = await this.myEmail(req)
    if (emailVerifiedAt) throw new ConflictError("이미 인증된 이메일입니다.")
    await this.emailCodeService.issue("verify", email)
  }

  @Post("me/email-verification/confirm")
  async confirmEmailVerification(
    @Req() req: Request,
    @Body() { code }: EmailCodeConfirmDto
  ) {
    const { id, email } = await this.myEmail(req)
    await this.emailCodeService.verify("verify", email, code)
    return this.userService.markEmailVerified(id)
  }

  @Patch(":id")
  @UseGuards(AdminGuard)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.userService.updateUser(id, updateUserDto)
  }

  @Patch(":id/approve")
  @UseGuards(AdminGuard)
  async approveUser(@Param("id", ParseIntPipe) id: number) {
    return this.userService.approveUser(id)
  }

  @Delete(":id")
  @UseGuards(AdminGuard)
  async deleteUser(@Param("id", ParseIntPipe) id: number) {
    return this.userService.deleteUser(id)
  }

  private async myEmail(req: Request) {
    const { sub } = req.user as JwtPayload
    const user = await this.userService.findDetailedById(sub)
    if (!user) throw new NotFoundError("존재하지 않는 사용자입니다.")
    return user
  }
}
