import { Test, TestingModule } from "@nestjs/testing"

import { GenerationController } from "./generation.controller"
import { GenerationService } from "./generation.service"

describe("GenerationController", () => {
  let controller: GenerationController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenerationController],
      providers: [
        {
          provide: GenerationService,
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

    controller = module.get<GenerationController>(GenerationController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
