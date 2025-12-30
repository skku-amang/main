import { Test, TestingModule } from "@nestjs/testing"
import { RentalService } from "./rental.service"

describe("RentalService", () => {
  let service: RentalService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RentalService]
    }).compile()

    service = module.get<RentalService>(RentalService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
