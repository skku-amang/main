import { Test, TestingModule } from "@nestjs/testing"
import { PushListener } from "./push.listener"
import { PushSender } from "./push.sender"
import { NotificationCreatedEvent } from "../notification/notification.events"
import { PrismaService } from "../prisma/prisma.service"

const NOON_KST = new Date("2026-10-16T03:00:00Z")
const HALF_PAST_MIDNIGHT_KST = new Date("2026-10-16T15:30:00Z")

type StoredUser = {
  id: number
  mutedNotificationTypes: string[]
  quietHoursEnabled: boolean
  quietHoursStart: number
  quietHoursEnd: number
}
const user = (id: number, partial: Partial<StoredUser> = {}): StoredUser => ({
  id,
  mutedNotificationTypes: [],
  quietHoursEnabled: true,
  quietHoursStart: 23,
  quietHoursEnd: 8,
  ...partial
})

const teamCreated = new NotificationCreatedEvent(
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

describe("PushListener", () => {
  let listener: PushListener
  let sendToUsers: jest.Mock
  let updateMany: jest.Mock
  let users: StoredUser[]

  beforeEach(async () => {
    jest.useFakeTimers({
      doNotFake: ["nextTick", "setImmediate", "setTimeout", "queueMicrotask"]
    })
    jest.setSystemTime(NOON_KST)
    users = [user(3), user(4)]
    sendToUsers = jest.fn(async () => undefined)
    updateMany = jest.fn(
      async ({ where }: { where: { id: { in: number[] } } }) => ({
        count: where.id.in.length
      })
    )
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushListener,
        { provide: PushSender, useValue: { sendToUsers } },
        {
          provide: PrismaService,
          useValue: {
            notification: { updateMany },
            user: {
              findMany: jest.fn(
                async ({ where }: { where: { id: { in: number[] } } }) =>
                  users.filter((u) => where.id.in.includes(u.id))
              )
            }
          }
        }
      ]
    }).compile()
    listener = module.get(PushListener)
  })

  afterEach(() => jest.useRealTimers())

  it("처리됨으로 먼저 찍은 뒤, 사람이 읽을 문구로 바꿔 수신자 전원에게 보낸다", async () => {
    await listener.onNotificationCreated(teamCreated)

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: { in: [11, 12] }, pushedAt: null },
      data: { pushedAt: NOON_KST }
    })
    expect(sendToUsers).toHaveBeenCalledWith([3, 4], {
      title: "봄 공연",
      body: "새 팀이 생겼습니다: 팀B",
      href: "/performances/1/teams/9",
      tag: "team-9"
    })
    expect(updateMany.mock.invocationCallOrder[0]).toBeLessThan(
      sendToUsers.mock.invocationCallOrder[0]!
    )
  })

  it("이미 처리된 알림이면(다른 경로가 먼저 찍음) 보내지 않는다", async () => {
    updateMany.mockResolvedValue({ count: 0 })

    await listener.onNotificationCreated(teamCreated)

    expect(sendToUsers).not.toHaveBeenCalled()
  })

  it("유형을 끈 사람에겐 보내지 않고 처리됨으로 닫는다, 나머지는 받는다", async () => {
    users = [user(3, { mutedNotificationTypes: ["TEAM_CREATED"] }), user(4)]

    await listener.onNotificationCreated(teamCreated)

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: { in: [11] }, pushedAt: null },
      data: { pushedAt: NOON_KST }
    })
    expect(sendToUsers).toHaveBeenCalledWith([4], expect.anything())
  })

  it("방해금지 중인 사람 것은 보내지 않고 미발송으로 남긴다 (아침에 flush)", async () => {
    jest.setSystemTime(HALF_PAST_MIDNIGHT_KST)
    users = [user(3), user(4, { quietHoursEnabled: false })]

    await listener.onNotificationCreated(teamCreated)

    expect(updateMany).toHaveBeenCalledTimes(1)
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: { in: [12] }, pushedAt: null },
      data: { pushedAt: HALF_PAST_MIDNIGHT_KST }
    })
    expect(sendToUsers).toHaveBeenCalledWith([4], expect.anything())
  })

  it("동방 예약 1시간 전은 방해금지 중에도 바로 보낸다", async () => {
    jest.setSystemTime(HALF_PAST_MIDNIGHT_KST)

    await listener.onNotificationCreated(
      new NotificationCreatedEvent(
        [3],
        {
          type: "ROOM_RESERVATION_SOON",
          payload: {
            rentalId: 5,
            title: "합주",
            startAt: new Date("2026-10-16T16:30:00Z")
          }
        },
        [11]
      )
    )

    expect(sendToUsers).toHaveBeenCalledWith([3], expect.anything())
  })

  it("발송이 실패해도 예외를 밖으로 던지지 않고 재시도하지 않는다 (처리됨 유지)", async () => {
    sendToUsers.mockRejectedValue(new Error("boom"))

    await expect(
      listener.onNotificationCreated(teamCreated)
    ).resolves.toBeUndefined()

    expect(updateMany).toHaveBeenCalledTimes(1)
  })
})
