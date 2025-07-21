import {
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"
import { ConfigService } from "@nestjs/config"
import { UsersService } from "../users/users.service"
import { LoginUserDto, CreateUserDto, JwtPayload } from "shared-types"
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto)
    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.name,
      user.isAdmin
    )
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken)
    return { ...tokens, user }
  }

  async login(loginDto: LoginUserDto) {
    const user = await this.usersService.findOneByEmail(loginDto.email)
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException(
        "이메일 또는 비밀번호가 올바르지 않습니다."
      )
    }

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.name,
      user.isAdmin
    )
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, hashedRefreshToken, ...userResponse } = user
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
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>("ACCESS_TOKEN_SECRET"),
        expiresIn: this.configService.get<string>("ACCESS_TOKEN_EXPIRES_IN")
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>("REFRESH_TOKEN_SECRET"),
        expiresIn: this.configService.get<string>("REFRESH_TOKEN_EXPIRES_IN")
      })
    ])

    return { accessToken, refreshToken }
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findOneById(userId)
    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException("Access Denied")
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken
    )
    if (!refreshTokenMatches) {
      throw new ForbiddenException("Access Denied")
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
