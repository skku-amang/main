import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy
} from "@nestjs/common"
import { Prisma, PrismaClient } from "@repo/database"

// Prisma는 PrismaClient 생성 전에 schema.prisma의 env("DATABASE_URL")를 검증하므로,
// 모듈 로드 시점에 즉시 세팅해야 한다.
if (!process.env.DATABASE_URL) {
  const user = process.env.POSTGRES_USER
  const password = process.env.POSTGRES_PASSWORD
  const host = process.env.DB_HOST
  const port = process.env.DB_PORT ?? "5432"
  const db = process.env.POSTGRES_DB

  if (user && password && host && db) {
    process.env.DATABASE_URL = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${db}?schema=public`
  }
}

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
      if (event.query === "SELECT 1") return
      this.logger.debug(event, "SQL Query")
    })

    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
