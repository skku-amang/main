import { Test, TestingModule } from "@nestjs/testing"

import { PrismaService } from "../prisma/prisma.service"
import { UsersService } from "./users.service"

describe("UsersService", () => {
  let service: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            // PrismaClient의 메서드들을 모의(mock) 처리합니다.
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn()
            }
          }
        }
      ]
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
