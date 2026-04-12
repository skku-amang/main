import { Test, TestingModule } from "@nestjs/testing"
import { TeamService } from "./team.service"
import { PrismaService } from "../prisma/prisma.service"
import { ObjectStorageService } from "../object-storage/object-storage.service"

describe("TeamService", () => {
  let service: TeamService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        {
          provide: PrismaService,
          useValue: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
          }
        },
        {
          provide: ObjectStorageService,
          useValue: {
            deleteObjectSafely: jest.fn()
          }
        }
      ]
    }).compile()

    service = module.get<TeamService>(TeamService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
