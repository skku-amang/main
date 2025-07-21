import { Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { UsersModule } from "../users/users.module"
import { JwtModule } from "@nestjs/jwt"
import { AccessTokenStrategy } from "./strategies/access-token.strategy"
import { RefreshTokenStrategy } from "./strategies/refresh-token.strategy"

@Module({
  imports: [UsersModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy]
})
export class AuthModule {}
