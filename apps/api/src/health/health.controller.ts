import { Controller, Get } from "@nestjs/common"
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator
} from "@nestjs/terminus"
import { PrismaService } from "../prisma/prisma.service"

@Controller("health")
export class HealthController {
  constructor(
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService
  ) {}

  @Get("live")
  live() {
    return { status: "ok" }
  }

  // version: 배포 자동화가 "새 이미지가 실제로 떠서 정상인지" 판별하는 기준 (#603)
  @Get()
  @HealthCheck()
  async check() {
    const result = await this.health.check([
      () => this.prismaHealth.pingCheck("database", this.prisma)
    ])
    return { ...result, version: process.env.GIT_SHA ?? "unknown" }
  }
}
