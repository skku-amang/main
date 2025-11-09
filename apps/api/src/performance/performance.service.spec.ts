import { Test, TestingModule } from "@nestjs/testing"

import { PrismaService } from "../prisma/prisma.service"
import { PerformanceService } from "./performance.service"

describe("PerformanceService", () => {
  let service: PerformanceService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerformanceService,
        {
          provide: PrismaService,
          useValue: {
            performance: {
              create: jest.fn(),
              findAll: jest.fn(),
              findTeamsByPerformanceId: jest.fn(),
              findOne: jest.fn(),
              update: jest.fn(),
              delete: jest.fn()
            }
          }
        }
      ]
    }).compile()

    service = module.get<PerformanceService>(PerformanceService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
