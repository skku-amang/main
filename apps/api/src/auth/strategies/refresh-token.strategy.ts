import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { AuthError } from "@repo/api-client"
import { JwtPayload } from "@repo/shared-types"
import { Request } from "express"
import { Strategy } from "passport-jwt"
import { REFRESH_TOKEN_COOKIE } from "../auth-cookie.util"

// 전환기: cookie(ADR-0002) 우선, 없으면 body(legacy next-auth 경로).
// body 추출은 Phase 2.6에서 next-auth 제거 시 함께 제거.
const extractRefreshToken = (req: Request): string | null =>
  req.cookies?.[REFRESH_TOKEN_COOKIE] ?? req.body?.refreshToken ?? null

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh"
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: extractRefreshToken,
      secretOrKey: configService.getOrThrow<string>("REFRESH_TOKEN_SECRET"),
      passReqToCallback: true
    })
  }

  validate(req: Request, payload: JwtPayload) {
    const refreshToken = extractRefreshToken(req)
    if (!refreshToken) {
      throw new AuthError("Refresh token is malformed.")
    }

    // req.user에 아래 객체가 주입됩니다.
    // 이 값은 이후 Controller의 @Req() 데코레이터를 통해 접근할 수 있습니다.
    return { ...payload, refreshToken } // req.user에 payload와 refreshToken이 주입됨
  }
}
