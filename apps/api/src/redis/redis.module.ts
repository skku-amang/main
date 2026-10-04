import { Inject, Module, OnApplicationShutdown } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import Redis from "ioredis"

export const REDIS_CLIENT = "REDIS_CLIENT"

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new Redis({
          host: configService.getOrThrow<string>("REDIS_HOST"),
          port: configService.get<number>("REDIS_PORT") ?? 6379,
          password: configService.getOrThrow<string>("REDIS_PASSWORD")
        })
    }
  ],
  exports: [REDIS_CLIENT]
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onApplicationShutdown() {
    await this.redis.quit()
  }
}
