import { Module } from "@nestjs/common"
import { RedisModule } from "../redis/redis.module"
import { EmailCodeService } from "./email-code.service"
import { MailService } from "./mail.service"

@Module({
  imports: [RedisModule],
  providers: [MailService, EmailCodeService],
  exports: [EmailCodeService]
})
export class EmailVerificationModule {}
