import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import {
  AuthError,
  RefreshTokenExpiredError,
  RefreshTokenNotFoundError,
  UserNotApprovedError
} from "@repo/api-client"
import { JwtPayload } from "@repo/shared-types"
import * as Sentry from "@sentry/nestjs"
import * as bcrypt from "bcrypt"
import { CreateUserDto } from "../users/dto/create-user.dto"
import { LoginUserDto } from "../users/dto/login-user.dto"
import { UsersService } from "../users/users.service"
import { AuthSessionStore } from "./auth-session.store"

type LoginContext = {
  userAgent?: string
  /** 같은 브라우저에 남아 있던 RT. 있으면 그 세션을 지우고 새로 만든다. */
  previousRefreshToken?: string | null
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authSessionStore: AuthSessionStore
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    await this.usersService.create(createUserDto)
    Sentry.metrics.count("signup.completed", 1, {
      attributes: { provider: "credentials" }
    })
  }

  async login(loginDto: LoginUserDto, context: LoginContext) {
    const user = await this.usersService.findOneByEmail(loginDto.email)
    if (!user) {
      throw new AuthError("존재하지 않는 이메일입니다.")
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password)
    if (!isMatch) {
      throw new AuthError("비밀번호가 일치하지 않습니다.")
    }

    if (!user.isApproved) {
      throw new UserNotApprovedError("아직 승인되지 않은 계정입니다.")
    }

    if (context.previousRefreshToken) {
      await this.deletePreviousSession(context.previousRefreshToken)
    }

    const sid = this.authSessionStore.newSid()
    const tokens = await this.getTokens(user.id, sid)
    await this.authSessionStore.save(
      user.id,
      sid,
      tokens.refreshToken,
      this.tokenTtls().refreshToken,
      { userAgent: context.userAgent }
    )

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userResponse } = user
    return { ...tokens, user: userResponse }
  }

  async logout(userId: number, sid: string) {
    await this.authSessionStore.delete(userId, sid)
  }

  tokenTtls() {
    return {
      accessToken: parseInt(
        this.configService.get<string>("ACCESS_TOKEN_EXPIRES_IN_SECONDS")!,
        10
      ),
      refreshToken: parseInt(
        this.configService.get<string>("REFRESH_TOKEN_EXPIRES_IN_SECONDS")!,
        10
      )
    }
  }

  async me(userId: number) {
    const user = await this.usersService.findDetailedById(userId)
    if (!user) {
      throw new AuthError("존재하지 않는 사용자입니다.")
    }
    return user
  }

  private async deletePreviousSession(refreshToken: string) {
    const payload = await this.jwtService
      .verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>("REFRESH_TOKEN_SECRET")
      })
      .catch(() => null)
    if (payload?.sid) {
      await this.authSessionStore.delete(payload.sub, payload.sid)
    }
  }

  private async getTokens(userId: number, sid: string) {
    const jwtPayload: JwtPayload = { sub: userId, sid }

    const {
      accessToken: accessTokenExpiresIn,
      refreshToken: refreshTokenExpiresIn
    } = this.tokenTtls()

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>("ACCESS_TOKEN_SECRET"),
        expiresIn: accessTokenExpiresIn
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>("REFRESH_TOKEN_SECRET"),
        expiresIn: refreshTokenExpiresIn
      })
    ])

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpiresIn
    }
  }

  async refreshTokens(userId: number, sid: string, refreshToken: string) {
    const user = await this.usersService.findOneById(userId)
    if (!user) {
      throw new RefreshTokenNotFoundError("리프레시 토큰이 존재하지 않습니다.")
    }

    if (!user.isApproved) {
      throw new UserNotApprovedError("아직 승인되지 않은 계정입니다.")
    }

    const matches = await this.authSessionStore.matches(
      userId,
      sid,
      refreshToken
    )
    if (matches === null) {
      throw new RefreshTokenNotFoundError("리프레시 토큰이 존재하지 않습니다.")
    }
    if (!matches) {
      throw new RefreshTokenExpiredError(
        "리프레시 토큰이 만료되었거나 존재하지 않습니다."
      )
    }

    const tokens = await this.getTokens(user.id, sid)
    await this.authSessionStore.rotate(
      user.id,
      sid,
      tokens.refreshToken,
      this.tokenTtls().refreshToken
    )
    return tokens
  }
}
