import { Test, TestingModule } from "@nestjs/testing"
import { RentalController } from "./rental.controller"
import { RentalService } from "./rental.service"

describe("RentalController", () => {
  let controller: RentalController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RentalController],
      providers: [RentalService]
    }).compile()

    controller = module.get<RentalController>(RentalController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
