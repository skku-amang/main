import { Test, TestingModule } from "@nestjs/testing"
import { HealthCheckService, PrismaHealthIndicator } from "@nestjs/terminus"
import { HealthController } from "./health.controller"
import { PrismaService } from "../prisma/prisma.service"

describe("HealthController", () => {
  let controller: HealthController
  let healthCheckService: HealthCheckService

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
            pingCheck: jest.fn().mockResolvedValue({
              database: { status: "up" }
            })
          }
        },
        {
          provide: PrismaService,
          useValue: {}
        }
      ]
    }).compile()

    controller = module.get<HealthController>(HealthController)
    healthCheckService = module.get<HealthCheckService>(HealthCheckService)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })

  it("should return health check result", async () => {
    const result = await controller.check()
    expect(result).toEqual({
      status: "ok",
      info: { database: { status: "up" } },
      error: {},
      details: { database: { status: "up" } }
    })
    expect(healthCheckService.check).toHaveBeenCalled()
  })
})
