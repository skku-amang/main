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
import { MeResponse } from "@repo/shared-types"
import { Request, Response } from "express"
import { CreateUserDto } from "../users/dto/create-user.dto"
import { LoginUserDto } from "../users/dto/login-user.dto"
import { clearAuthCookies, setAuthCookies } from "./auth-cookie.util"
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

  // 전환기: 토큰을 Set-Cookie(ADR-0002)와 응답 body(legacy next-auth 경로)로
  // 함께 내려준다. body 토큰은 Phase 2.6에서 next-auth 제거 시 함께 제거.
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.login(loginUserDto)
    setAuthCookies(res, result, this.authService.tokenTtls())
    return result
  }

  @Post("logout")
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { sub: userId } = req.user as { sub: number }
    await this.authService.logout(userId)
    clearAuthCookies(res)
    return { message: "성공적으로 로그아웃되었습니다." }
  }

  @Post("refresh")
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const { sub: userId, refreshToken } = req.user as {
      sub: number
      refreshToken: string
    }
    const tokens = await this.authService.refreshTokens(userId, refreshToken)
    setAuthCookies(res, tokens, this.authService.tokenTtls())
    return tokens
  }

  @Get("me")
  @UseGuards(AccessTokenGuard)
  async me(@Req() req: Request): Promise<MeResponse> {
    const { sub: userId } = req.user as { sub: number }
    const user = await this.authService.me(userId)
    return { user }
  }
}
