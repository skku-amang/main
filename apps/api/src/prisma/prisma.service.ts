import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy
} from "@nestjs/common"
import { Prisma, PrismaClient } from "@repo/database"

// 노드 재부팅 직후엔 DB가 API보다 늦게 뜬다 (#659). 대기 합계 45초 — startupProbe 유예(180초) 안에 끝나도록
const CONNECT_RETRY_DELAYS_MS = [1_000, 2_000, 4_000, 8_000, 15_000, 15_000]

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

    await this.connectWithRetry()
  }

  private async connectWithRetry() {
    for (const delay of CONNECT_RETRY_DELAYS_MS) {
      try {
        return await this.$connect()
      } catch (error) {
        this.logger.warn(
          `DB 연결 실패, ${delay / 1000}초 뒤 다시 시도: ${(error as Error).message}`
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
