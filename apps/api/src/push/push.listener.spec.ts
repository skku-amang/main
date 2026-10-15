import { Test, TestingModule } from "@nestjs/testing"
import { PushListener } from "./push.listener"
import { PushSender } from "./push.sender"
import { NotificationCreatedEvent } from "../notification/notification.events"

describe("PushListener", () => {
  let listener: PushListener
  let sendToUsers: jest.Mock

  beforeEach(async () => {
    sendToUsers = jest.fn(async () => undefined)
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushListener,
        { provide: PushSender, useValue: { sendToUsers } }
      ]
    }).compile()
    listener = module.get(PushListener)
  })

  it("저장된 알림을 사람이 읽을 문구로 바꿔 수신자 전원에게 보낸다", async () => {
    await listener.onNotificationCreated(
      new NotificationCreatedEvent([3, 4], {
        type: "TEAM_CREATED",
        payload: {
          performanceId: 1,
          performanceName: "봄 공연",
          teamId: 9,
          teamName: "팀B"
        }
      })
    )

    expect(sendToUsers).toHaveBeenCalledWith([3, 4], {
      title: "봄 공연",
      body: "새 팀이 생겼습니다: 팀B",
      href: "/performances/1/teams/9",
      tag: "team-9"
    })
  })

  it("발송이 실패해도 예외를 밖으로 던지지 않는다", async () => {
    sendToUsers.mockRejectedValue(new Error("boom"))

    await expect(
      listener.onNotificationCreated(
        new NotificationCreatedEvent([3], {
          type: "PERFORMANCE_CREATED",
          payload: { performanceId: 1, performanceName: "봄 공연" }
        })
      )
    ).resolves.toBeUndefined()
  })
})
