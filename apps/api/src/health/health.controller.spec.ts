import { Test, TestingModule } from "@nestjs/testing"
import { HealthCheckService } from "@nestjs/terminus"
import { HealthController } from "./health.controller"
import { PrismaHealthIndicator } from "./prisma.health"

describe("HealthController", () => {
  let controller: HealthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn().mockResolvedValue({
              status: "ok",
              info: { database: { status: "up" } },
              error: {},
              details: { database: { status: "up" } }
            })
          }
        },
        {
          provide: PrismaHealthIndicator,
          useValue: {
            isHealthy: jest.fn().mockResolvedValue({
              database: { status: "up" }
            })
          }
        }
      ]
    }).compile()

    controller = module.get<HealthController>(HealthController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
