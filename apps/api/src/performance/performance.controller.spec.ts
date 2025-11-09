import { Test, TestingModule } from "@nestjs/testing"

import { PerformanceController } from "./performance.controller"
import { PerformanceService } from "./performance.service"

describe("PerformanceController", () => {
  let controller: PerformanceController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerformanceController],
      providers: [
        {
          provide: PerformanceService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findTeamsByPerformanceId: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn()
          }
        }
      ]
    }).compile()

    controller = module.get<PerformanceController>(PerformanceController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
