import { Test, TestingModule } from "@nestjs/testing"
import { AdminGuard } from "../auth/guards/admin.guard"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"

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
        }
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
