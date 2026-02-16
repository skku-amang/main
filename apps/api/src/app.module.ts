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
import { PerformanceModule } from "./performance/performance.module"
import { EquipmentModule } from "./equipment/equipment.module"
import { RentalModule } from "./rental/rental.module"
import { ObjectStorageModule } from "./object-storage/object-storage.module"
import { UploadModule } from "./upload/upload.module"
import { HealthModule } from "./health/health.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true
    }),
    PrismaModule,
    HealthModule,
    UsersModule,
    AuthModule,
    GenerationModule,
    SessionModule,
    TeamModule,
    PerformanceModule,
    EquipmentModule,
    RentalModule,
    ObjectStorageModule,
    UploadModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
