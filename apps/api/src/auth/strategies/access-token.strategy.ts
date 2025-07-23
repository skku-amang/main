import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { JwtPayload } from "@repo/shared-types" // Adjust the import path as necessary
import { ExtractJwt, Strategy } from "passport-jwt"

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-access"
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>("ACCESS_TOKEN_SECRET")
    })
  }

  validate(payload: JwtPayload) {
    return payload // req.user에 payload가 주입됨
  }
}
