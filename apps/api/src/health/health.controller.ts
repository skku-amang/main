import { Controller, Get } from "@nestjs/common"
import { HealthCheck, HealthCheckService } from "@nestjs/terminus"
import { PrismaHealthIndicator } from "./prisma.health"

@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.prismaHealth.isHealthy("database")])
  }
}
