import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common"
import { Prisma, PrismaClient } from "@repo/database"
import { InjectPinoLogger, PinoLogger } from "nestjs-pino"

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @InjectPinoLogger(PrismaService.name)
    private readonly logger: PinoLogger
  ) {
    super({
      log: [
        { emit: "event", level: "error" },
        { emit: "event", level: "info" },
        { emit: "event", level: "warn" },
        ...(process.env.NODE_ENV !== "production"
          ? [{ emit: "event" as const, level: "query" as const }]
          : [])
      ]
    })
  }

  async onModuleInit() {
    this.$on("error", (event) => {
      this.logger.error(event)
    })
    this.$on("warn", (event) => {
      this.logger.warn(event)
    })
    this.$on("info", (event) => {
      this.logger.info(event)
    })
    if (process.env.NODE_ENV !== "production") {
      this.$on("query", (event) => {
        this.logger.debug(
          {
            query: event.query,
            params: event.params,
            duration: event.duration,
            target: event.target
          },
          "SQL Query"
        )
      })
    }

    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
