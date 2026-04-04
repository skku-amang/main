import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import {
  AuthError,
  ForbiddenError,
  UserNotApprovedError
} from "@repo/api-client"
import { JwtPayload } from "@repo/shared-types"
import * as bcrypt from "bcrypt"
import { CreateUserDto } from "../users/dto/create-user.dto"
import { LoginUserDto } from "../users/dto/login-user.dto"
import { UsersService } from "../users/users.service"
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    await this.usersService.create(createUserDto)
  }

  async login(loginDto: LoginUserDto) {
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

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.name,
      user.isAdmin
    )
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userResponse } = user
    return { ...tokens, user: userResponse }
  }

  async logout(userId: number) {
    return this.usersService.updateRefreshToken(userId, null)
  }

  private async getTokens(
    userId: number,
    email: string,
    name: string,
    isAdmin: boolean
  ) {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email,
      name,
      isAdmin
    }

    const accessTokenExpiresIn = parseInt(
      this.configService.get<string>("ACCESS_TOKEN_EXPIRES_IN_SECONDS")!,
      10
    )
    const refreshTokenExpiresIn = parseInt(
      this.configService.get<string>("REFRESH_TOKEN_EXPIRES_IN_SECONDS")!,
      10
    )

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

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findOneById(userId)
    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenError("Access Denied")
    }

    if (!user.isApproved) {
      throw new UserNotApprovedError("아직 승인되지 않은 계정입니다.")
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken
    )
    if (!refreshTokenMatches) {
      throw new ForbiddenError("Access Denied")
    }

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.name,
      user.isAdmin
    )
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken)
    return tokens
  }
}
