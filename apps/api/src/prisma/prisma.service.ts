import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy
} from "@nestjs/common"
import { Prisma, PrismaClient } from "@repo/database"

function buildDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return undefined

  const user = process.env.POSTGRES_USER
  const password = process.env.POSTGRES_PASSWORD
  const host = process.env.DB_HOST
  const port = process.env.DB_PORT ?? "5432"
  const db = process.env.POSTGRES_DB

  if (!user || !password || !host || !db) return undefined

  const url = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${db}?schema=public`
  process.env.DATABASE_URL = url
  return url
}

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    const datasourceUrl = buildDatabaseUrl()
    super({
      log: [
        { emit: "event", level: "query" },
        { emit: "event", level: "error" },
        { emit: "event", level: "info" },
        { emit: "event", level: "warn" }
      ],
      ...(datasourceUrl && { datasourceUrl })
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
