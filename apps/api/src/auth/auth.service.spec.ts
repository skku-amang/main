import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { Test, TestingModule } from "@nestjs/testing"

import { UsersService } from "../users/users.service"
import { AuthService } from "./auth.service"

describe("AuthService", () => {
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findOneByEmail: jest.fn(),
            findOneById: jest.fn(),
            updateRefreshToken: jest.fn()
          }
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn()
          }
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn()
          }
        }
      ]
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
