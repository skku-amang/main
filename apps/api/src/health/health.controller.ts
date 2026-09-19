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

  // liveness 전용: 외부 의존성을 보면 DB 장애 때 kubelet이 API를 무한 재시작한다 (Sentry API-5).
  // DB 연결은 readiness인 아래 check()가 확인한다.
  @Get("live")
  live() {
    return { status: "ok" }
  }

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck("database", this.prisma)
    ])
  }
}
