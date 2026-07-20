import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { JwtPayload } from "@repo/shared-types"
import { Request } from "express"
import { ExtractJwt, Strategy } from "passport-jwt"
import { ACCESS_TOKEN_COOKIE } from "../auth-cookie.util"

// 전환기: Authorization 헤더(legacy) 우선, 없으면 cookie(ADR-0002).
// 헤더 추출은 Phase 2.7에서 next-auth 제거 완료 후 정리 검토.
const fromCookie = (req: Request): string | null =>
  req.cookies?.[ACCESS_TOKEN_COOKIE] ?? null

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-access"
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        fromCookie
      ]),
      secretOrKey: configService.getOrThrow<string>("ACCESS_TOKEN_SECRET")
    })
  }

  validate(payload: JwtPayload) {
    return payload // req.user에 payload가 주입됨
  }
}
