import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { ConfigModule } from "@nestjs/config"
import { PrismaModule } from "./prisma/prisma.module"
import { UsersModule } from "./users/users.module"
import { AuthModule } from "./auth/auth.module"
import { GenerationModule } from "./generation/generation.module"
import { SessionModule } from "./session/session.module"
import { TeamModule } from "./team/team.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    GenerationModule,
    SessionModule,
    TeamModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
