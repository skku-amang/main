import { Test, TestingModule } from "@nestjs/testing"
import { PushListener } from "./push.listener"
import { PushSender } from "./push.sender"
import { NotificationCreatedEvent } from "../notification/notification.events"
import { PrismaService } from "../prisma/prisma.service"

const NOON_KST = new Date("2026-10-16T03:00:00Z")
const HALF_PAST_MIDNIGHT_KST = new Date("2026-10-16T15:30:00Z")

describe("PushListener", () => {
  let listener: PushListener
  let sendToUsers: jest.Mock
  let updateMany: jest.Mock

  beforeEach(async () => {
    jest.useFakeTimers({
      doNotFake: ["nextTick", "setImmediate", "setTimeout", "queueMicrotask"]
    })
    jest.setSystemTime(NOON_KST)
    sendToUsers = jest.fn(async () => undefined)
    updateMany = jest.fn(async () => ({ count: 2 }))
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushListener,
        { provide: PushSender, useValue: { sendToUsers } },
        { provide: PrismaService, useValue: { notification: { updateMany } } }
      ]
    }).compile()
    listener = module.get(PushListener)
  })

  afterEach(() => jest.useRealTimers())

  it("저장된 알림을 사람이 읽을 문구로 바꿔 수신자 전원에게 보내고 발송 시각을 남긴다", async () => {
    await listener.onNotificationCreated(
      new NotificationCreatedEvent(
        [3, 4],
        {
          type: "TEAM_CREATED",
          payload: {
            performanceId: 1,
            performanceName: "봄 공연",
            teamId: 9,
            teamName: "팀B"
          }
        },
        [11, 12]
      )
    )

    expect(sendToUsers).toHaveBeenCalledWith([3, 4], {
      title: "봄 공연",
      body: "새 팀이 생겼습니다: 팀B",
      href: "/performances/1/teams/9",
      tag: "team-9"
    })
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: { in: [11, 12] } },
      data: { pushedAt: NOON_KST }
    })
  })

  it("방해금지 시간대엔 보내지 않고 미발송으로 남긴다", async () => {
    jest.setSystemTime(HALF_PAST_MIDNIGHT_KST)

    await listener.onNotificationCreated(
      new NotificationCreatedEvent(
        [3],
        {
          type: "PERFORMANCE_CREATED",
          payload: { performanceId: 1, performanceName: "봄 공연" }
        },
        [11]
      )
    )

    expect(sendToUsers).not.toHaveBeenCalled()
    expect(updateMany).not.toHaveBeenCalled()
  })

  it("발송이 실패해도 예외를 밖으로 던지지 않는다", async () => {
    sendToUsers.mockRejectedValue(new Error("boom"))

    await expect(
      listener.onNotificationCreated(
        new NotificationCreatedEvent(
          [3],
          {
            type: "PERFORMANCE_CREATED",
            payload: { performanceId: 1, performanceName: "봄 공연" }
          },
          [11]
        )
      )
    ).resolves.toBeUndefined()
  })
})
