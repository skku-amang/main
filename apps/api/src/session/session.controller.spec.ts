import { Test, TestingModule } from "@nestjs/testing"

import { SessionController } from "./session.controller"
import { SessionService } from "./session.service"

describe("SessionController", () => {
  let controller: SessionController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [
        {
          provide: SessionService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn()
          }
        }
      ]
    }).compile()

    controller = module.get<SessionController>(SessionController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
