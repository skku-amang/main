import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { JwtPayload } from "@repo/shared-types"
import { Strategy } from "passport-jwt"
import { extractAccessToken } from "../auth-cookie.util"

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-access"
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: extractAccessToken,
      secretOrKey: configService.getOrThrow<string>("ACCESS_TOKEN_SECRET")
    })
  }

  validate(payload: JwtPayload) {
    return payload // req.user에 payload가 주입됨
  }
}
