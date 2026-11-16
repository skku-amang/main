import { Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { UsersModule } from "../users/users.module"
import { JwtModule } from "@nestjs/jwt"
import { AccessTokenStrategy } from "./strategies/access-token.strategy"
import { RefreshTokenStrategy } from "./strategies/refresh-token.strategy"
import { RedisModule } from "../redis/redis.module"
import { AuthSessionStore } from "./auth-session.store"
import { EmailVerificationModule } from "../email-verification/email-verification.module"

@Module({
  imports: [
    UsersModule,
    JwtModule.register({}),
    RedisModule,
    EmailVerificationModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthSessionStore,
    AccessTokenStrategy,
    RefreshTokenStrategy
  ]
})
export class AuthModule {}
