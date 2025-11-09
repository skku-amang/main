import { Test, TestingModule } from "@nestjs/testing"

import { TeamController } from "./team.controller"
import { TeamService } from "./team.service"

describe("TeamController", () => {
  let controller: TeamController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamController],
      providers: [
        {
          provide: TeamService,
          useValue: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
          }
        }
      ]
    }).compile()

    controller = module.get<TeamController>(TeamController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
