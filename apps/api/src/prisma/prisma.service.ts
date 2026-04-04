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

  constructor() {
    super({
      log: [
        { emit: "event", level: "query" },
        { emit: "event", level: "error" },
        { emit: "event", level: "info" },
        { emit: "event", level: "warn" }
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
    this.$on("query", (event) => {
      if (event.target === "quaint::connector::metrics") return
      this.logger.debug(event, "SQL Query")
    })

    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
