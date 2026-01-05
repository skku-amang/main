import { Test, TestingModule } from "@nestjs/testing"
import { RentalController } from "./rental.controller"
import { RentalService } from "./rental.service"
import { AccessTokenGuard } from "../auth/guards/access-token.guard"
import { RentalOwnerGuard } from "../auth/guards/rental-owner.guard"

describe("RentalController", () => {
  let controller: RentalController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RentalController],
      providers: [
        {
          provide: RentalService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn()
          }
        }
      ]
    })
      .overrideGuard(AccessTokenGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RentalOwnerGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<RentalController>(RentalController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
