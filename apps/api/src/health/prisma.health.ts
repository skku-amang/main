import { Injectable } from "@nestjs/common"
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult
} from "@nestjs/terminus"
import { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRawUnsafe("SELECT 1")
      return this.getStatus(key, true)
    } catch (error) {
      throw new HealthCheckError(
        "Database health check failed",
        this.getStatus(key, false, { message: (error as Error).message })
      )
    }
  }
}
