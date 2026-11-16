import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { JwtService } from "@nestjs/jwt"
import {
  AuthError,
  ConflictError,
  NotFoundError,
  ValidationError,
  RefreshTokenExpiredError,
  RefreshTokenNotFoundError,
  UserNotApprovedError
} from "@repo/api-client"
import { AuthSessionInfo, JwtPayload } from "@repo/shared-types"
import * as Sentry from "@sentry/nestjs"
import * as bcrypt from "bcrypt"
import { EmailCodeService } from "../email-verification/email-code.service"
import { SignupDto } from "../email-verification/email-verification.dto"
import { LoginUserDto } from "../users/dto/login-user.dto"
import { USER_EVENTS, UserSignedUpEvent } from "../users/users.events"
import { UsersService } from "../users/users.service"
import { AuthSessionStore } from "./auth-session.store"
import { PasswordResetTokenStore } from "./password-reset-token.store"

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authSessionStore: AuthSessionStore,
    private readonly eventEmitter: EventEmitter2,
    private readonly emailCodeService: EmailCodeService,
    private readonly passwordResetTokenStore: PasswordResetTokenStore
  ) {}

  async requestSignupEmailCode(email: string) {
    if (await this.usersService.findOneByEmail(email))
      throw new ConflictError("이미 사용중인 이메일입니다.")
    await this.emailCodeService.issue("signup", email)
  }

  async signUp({ emailCode, ...createUserDto }: SignupDto) {
    // 번호는 가입이 저장된 뒤에 지운다 — 닉네임 중복 등으로 저장이 실패해도 같은 번호로 다시 가입할 수 있다.
    // 같은 번호로 동시에 가입해도 이메일이 unique라 한 건만 저장된다
    await this.emailCodeService.check("signup", createUserDto.email, emailCode)
    const user = await this.usersService.create(createUserDto, {
      emailVerified: true
    })
    this.eventEmitter.emit(
      USER_EVENTS.SIGNED_UP,
      new UserSignedUpEvent(user.id)
    )
    // 가입은 이미 끝났다. 번호를 못 지워도 10분 뒤 사라지고, 그 이메일로는 다시 가입할 수 없다
    await this.emailCodeService
      .consume("signup", createUserDto.email)
      .catch((error: Error) =>
        this.logger.warn(`가입 인증번호 삭제 실패: ${error.message}`)
      )
    Sentry.metrics.count("signup.completed", 1, {
      attributes: { provider: "credentials" }
    })
  }

  /** 인증된 회원에게만 보낸다. 없거나 미인증이어도 같은 응답 (#528) */
  async requestPasswordReset(email: string) {
    const user = await this.usersService.findOneByEmail(email)
    if (!user?.emailVerifiedAt) return
    await this.emailCodeService.issue("reset", email)
  }

  async resetPasswordWithCode({
    email,
    code,
    newPassword
  }: {
    email: string
    code: string
    newPassword: string
  }) {
    const user = await this.usersService.findOneByEmail(email)
    if (!user?.emailVerifiedAt)
      throw new ValidationError("인증번호가 맞지 않거나 만료되었습니다.")
    await this.emailCodeService.verify("reset", email, code)
    await this.replacePassword(user.id, newPassword)
  }

  async createPasswordResetLink(userId: number) {
    if (!(await this.usersService.findOneById(userId)))
      throw new NotFoundError(`ID가 ${userId}인 사용자를 찾을 수 없습니다.`)
    const { token, expiresAt } =
      await this.passwordResetTokenStore.create(userId)
    return { token, expiresAt: expiresAt.toISOString() }
  }

  async resetPasswordWithToken({
    token,
    newPassword
  }: {
    token: string
    newPassword: string
  }) {
    const userId = await this.passwordResetTokenStore.consume(token)
    if (userId === null)
      throw new ValidationError(
        "링크가 만료되었거나 이미 사용되었습니다. 운영진에게 새 링크를 받아주세요."
      )
    await this.replacePassword(userId, newPassword)
  }

  /** 비밀번호가 새어 나갔을 수 있으니 모든 기기를 로그아웃시킨다 */
  private async replacePassword(userId: number, newPassword: string) {
    await this.usersService.setPassword(userId, newPassword)
    await this.authSessionStore.deleteAllExcept(userId, "")
  }

  async login(
    loginDto: LoginUserDto,
    context: { userAgent?: string; previousRefreshToken?: string | null }
  ) {
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

  async logoutOtherSessions(userId: number, currentSid: string) {
    await this.authSessionStore.deleteAllExcept(userId, currentSid)
  }

  async listSessions(
    userId: number,
    currentSid: string
  ): Promise<AuthSessionInfo[]> {
    const sessions = await this.authSessionStore.list(userId)
    return sessions
      .map((session) => ({ ...session, current: session.sid === currentSid }))
      .sort(
        (a, b) =>
          Number(b.current) - Number(a.current) ||
          b.lastUsedAt.localeCompare(a.lastUsedAt)
      )
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
