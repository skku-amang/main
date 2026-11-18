import { Test, TestingModule } from "@nestjs/testing"
import { AdminGuard } from "../auth/guards/admin.guard"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"
import { EmailCodeService } from "../email-verification/email-code.service"

describe("UsersController", () => {
  let controller: UsersController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn()
          }
        },
        { provide: EmailCodeService, useValue: {} }
      ]
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<UsersController>(UsersController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
