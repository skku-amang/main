import { Inject, Logger, Module, OnApplicationShutdown } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import Redis from "ioredis"

export const REDIS_CLIENT = "REDIS_CLIENT"

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redis = new Redis({
          host: configService.getOrThrow<string>("REDIS_HOST"),
          password: configService.getOrThrow<string>("REDIS_PASSWORD"),
          // fail-fast
          maxRetriesPerRequest: 1,
          connectTimeout: 2000
        })
        const logger = new Logger("Redis")
        redis.on("error", (error) => logger.error(error))
        return redis
      }
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
