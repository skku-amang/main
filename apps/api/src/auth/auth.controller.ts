import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards
} from "@nestjs/common"
import { JwtPayload, LoginResponse, MeResponse } from "@repo/shared-types"
import { Request, Response } from "express"
import { CreateUserDto } from "../users/dto/create-user.dto"
import { LoginUserDto } from "../users/dto/login-user.dto"
import {
  clearAuthCookies,
  extractRefreshToken,
  setAuthCookies
} from "./auth-cookie.util"
import { AuthService } from "./auth.service"
import { AccessTokenGuard } from "./guards/access-token.guard"
import { RefreshTokenGuard } from "./guards/refresh-token.guard"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createUserDto: CreateUserDto) {
    await this.authService.signUp(createUserDto)

    return {
      message: "회원가입이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다."
    }
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<LoginResponse> {
    const { user, ...tokens } = await this.authService.login(loginUserDto, {
      userAgent: req.headers["user-agent"],
      previousRefreshToken: extractRefreshToken(req)
    })
    setAuthCookies(res, tokens, this.authService.tokenTtls())
    return { user }
  }

  @Post("logout")
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    const { sub: userId, sid } = req.user as JwtPayload
    await this.authService.logout(userId, sid)
    clearAuthCookies(res)
  }

  @Post("refresh")
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    const {
      sub: userId,
      sid,
      refreshToken
    } = req.user as JwtPayload & { refreshToken: string }
    const tokens = await this.authService.refreshTokens(
      userId,
      sid,
      refreshToken
    )
    setAuthCookies(res, tokens, this.authService.tokenTtls())
  }

  @Get("me")
  @UseGuards(AccessTokenGuard)
  async me(@Req() req: Request): Promise<MeResponse> {
    const { sub: userId } = req.user as { sub: number }
    const user = await this.authService.me(userId)
    return { user }
  }
}
