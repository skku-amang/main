import { Test, TestingModule } from "@nestjs/testing"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { UsersService } from "./users.service"
import {
  USER_EVENTS,
  UserApprovedEvent,
  UserSignedUpEvent
} from "./users.events"
import { PrismaService } from "../prisma/prisma.service"

describe("UsersService", () => {
  let service: UsersService
  let emit: jest.Mock

  beforeEach(async () => {
    emit = jest.fn()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(async () => ({ id: 5 })),
              findUnique: jest.fn(async () => ({ id: 5, isApproved: false })),
              update: jest.fn(async () => ({ id: 5 }))
            }
          }
        },
        { provide: EventEmitter2, useValue: { emit } }
      ]
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  it("가입 신청이 저장되면 user.signed_up을 발행한다", async () => {
    await service.create({
      email: "a@b.c",
      password: "pw",
      name: "홍길동",
      nickname: "gil",
      generationId: 1,
      sessions: []
    })

    expect(emit).toHaveBeenCalledWith(
      USER_EVENTS.SIGNED_UP,
      new UserSignedUpEvent(5)
    )
  })

  it("승인되면 user.approved에 본인과 승인한 운영진이 담긴다", async () => {
    await service.approveUser(5, 1)

    expect(emit).toHaveBeenCalledWith(
      USER_EVENTS.APPROVED,
      new UserApprovedEvent(5, 1)
    )
  })
})
