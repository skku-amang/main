import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy
} from "@nestjs/common"
import { PrismaClient } from "@repo/database"

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    super({
      log: [
        { emit: "event", level: "query" },
        { emit: "event", level: "error" },
        { emit: "event", level: "warn" }
      ]
    })
  }

  async onModuleInit() {
    await this.$connect()

    this.$on("query" as never, (event: Record<string, unknown>) => {
      this.logger.debug(
        `Query: ${event.query} | Params: ${event.params} | Duration: ${event.duration}ms`
      )
    })

    this.$on("error" as never, (event: Record<string, unknown>) => {
      this.logger.error(`Prisma Error: ${event.message}`)
    })

    this.$on("warn" as never, (event: Record<string, unknown>) => {
      this.logger.warn(`Prisma Warning: ${event.message}`)
    })

    this.logger.log("Prisma connected to database")
  }

  async onModuleDestroy() {
    await this.$disconnect()
    this.logger.log("Prisma disconnected from database")
  }
}
