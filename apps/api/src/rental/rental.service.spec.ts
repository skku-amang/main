import { Test, TestingModule } from "@nestjs/testing"
import { RentalService } from "./rental.service"
import { PrismaService } from "../prisma/prisma.service"

describe("RentalService", () => {
  let service: RentalService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RentalService,
        {
          provide: PrismaService,
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

    service = module.get<RentalService>(RentalService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
