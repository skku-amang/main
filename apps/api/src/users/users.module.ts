import { Module } from "@nestjs/common"
import { UsersService } from "./users.service"
import { UsersController } from "./users.controller"
import { EmailVerificationModule } from "../email-verification/email-verification.module"

@Module({
  imports: [EmailVerificationModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
