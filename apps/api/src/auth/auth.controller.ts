import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards
} from "@nestjs/common"
import { Request } from "express"
import { CreateUserDto } from "../users/dto/create-user.dto"
import { LoginUserDto } from "../users/dto/login-user.dto"
import { AuthService } from "./auth.service"
import { AccessTokenGuard } from "./guards/access-token.guard"
import { RefreshTokenGuard } from "./guards/refresh-token.guard"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto)
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto)
  }

  @Post("logout")
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    const { sub: userId } = req.user as { sub: number }
    await this.authService.logout(userId)
    return { message: "성공적으로 로그아웃되었습니다." }
  }

  @Post("refresh")
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Req() req: Request) {
    const { sub: userId, refreshToken } = req.user as {
      sub: number
      refreshToken: string
    }
    return this.authService.refreshTokens(userId, refreshToken)
  }
}
