import { Test, TestingModule } from "@nestjs/testing"
import { EquipmentService } from "./equipment.service"
import { PrismaService } from "../prisma/prisma.service"

describe("EquipmentService", () => {
  let service: EquipmentService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EquipmentService,
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

    service = module.get<EquipmentService>(EquipmentService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
