import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy
} from "@nestjs/common"
import { Prisma, PrismaClient } from "@repo/database"

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name)
  private static readonly isProduction =
    process.env.NODE_ENV === "production"

  constructor() {
    super({
      log: [
        { emit: "event", level: "error" },
        { emit: "event", level: "warn" },
        { emit: "event", level: "info" },
        ...(PrismaService.isProduction
          ? []
          : [{ emit: "event" as const, level: "query" as const }])
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
      this.logger.log(event)
    })

    if (!PrismaService.isProduction) {
      this.$on("query", (event) => {
        this.logger.debug(event, "SQL Query")
      })
    }

    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
