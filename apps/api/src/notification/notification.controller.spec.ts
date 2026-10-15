import { Test, TestingModule } from "@nestjs/testing"
import { Request } from "express"
import { NotificationController } from "./notification.controller"
import { NotificationService } from "./notification.service"

describe("NotificationController", () => {
  let controller: NotificationController
  let service: { findAll: jest.Mock; markRead: jest.Mock }
  const req = { user: { sub: 7, sid: "s" } } as unknown as Request

  beforeEach(async () => {
    service = {
      findAll: jest.fn(async () => ({ items: [], nextCursor: null })),
      markRead: jest.fn(async () => ({ id: 3 }))
    }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [{ provide: NotificationService, useValue: service }]
    }).compile()

    controller = module.get(NotificationController)
  })

  it("목록은 로그인한 사용자 기준으로 조회한다", async () => {
    await controller.findAll(req, { limit: 20 })
    expect(service.findAll.mock.calls[0][0]).toBe(7)
  })

  it("읽음 처리는 로그인한 사용자와 알림 id로 한다", async () => {
    await controller.markRead(req, 3)
    expect(service.markRead.mock.calls[0]).toEqual([7, 3])
  })
})
