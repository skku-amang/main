import { Test, TestingModule } from "@nestjs/testing"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { UsersService } from "./users.service"
import { USER_EVENTS, UserApprovedEvent } from "./users.events"
import { PrismaService } from "../prisma/prisma.service"

describe("UsersService", () => {
  let service: UsersService
  let emit: jest.Mock
  let update: jest.Mock
  let stored: { id: number; isApproved: boolean }

  beforeEach(async () => {
    emit = jest.fn()
    update = jest.fn(async () => stored)
    stored = { id: 5, isApproved: false }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(async () => stored),
              update
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

  it("승인하면 user.approved를 발행한다", async () => {
    await service.approveUser(5)

    expect(emit).toHaveBeenCalledWith(
      USER_EVENTS.APPROVED,
      new UserApprovedEvent(5)
    )
  })

  it("이미 승인된 사용자를 다시 승인해도 갱신·알림이 없다", async () => {
    stored.isApproved = true

    await service.approveUser(5)

    expect(update).not.toHaveBeenCalled()
    expect(emit).not.toHaveBeenCalled()
  })
})
