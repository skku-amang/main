import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { JwtPayload } from "@repo/shared-types"
import { Request } from "express"
import { Strategy } from "passport-jwt"
import { ACCESS_TOKEN_COOKIE } from "../auth-cookie.util"

const fromCookie = (req: Request): string | null =>
  req.cookies?.[ACCESS_TOKEN_COOKIE] ?? null

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-access"
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: fromCookie,
      secretOrKey: configService.getOrThrow<string>("ACCESS_TOKEN_SECRET")
    })
  }

  validate(payload: JwtPayload) {
    return payload // req.user에 payload가 주입됨
  }
}
