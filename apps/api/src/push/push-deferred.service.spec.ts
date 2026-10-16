import { Test, TestingModule } from "@nestjs/testing"
import { PrismaService } from "../prisma/prisma.service"
import { PushDeferredService } from "./push-deferred.service"
import { PushSender } from "./push.sender"

const MORNING_KST = new Date("2026-10-17T00:05:00Z") // 10-17 09:05 KST
const MIDNIGHT_KST = new Date("2026-10-16T15:30:00Z") // 10-17 00:30 KST

type Recipient = {
  id: number
  mutedNotificationTypes: string[]
  quietHoursEnabled: boolean
  quietHoursStart: number
  quietHoursEnd: number
}
type Row = {
  id: number
  recipientId: number
  type: string
  payload: Record<string, unknown>
  readAt: Date | null
  createdAt: Date
  pushedAt: Date | null
  recipient: Recipient
}
type Where = { pushedAt: null; id?: { in: number[] } }

const performanceCreated = {
  type: "PERFORMANCE_CREATED",
  payload: { performanceId: 1, performanceName: "봄 공연" }
}

const recipient = (
  id: number,
  partial: Partial<Recipient> = {}
): Recipient => ({
  id,
  mutedNotificationTypes: [],
  quietHoursEnabled: true,
  quietHoursStart: 23,
  quietHoursEnd: 8,
  ...partial
})

describe("PushDeferredService.flush", () => {
  let service: PushDeferredService
  let sendToUsers: jest.Mock
  let rows: Row[]

  const row = (partial: Partial<Row> & { id: number }): Row => ({
    recipientId: 3,
    readAt: null,
    createdAt: new Date("2026-10-16T16:00:00Z"), // 10-17 01:00 KST, 방해금지 중 생성
    pushedAt: null,
    recipient: recipient(3),
    ...performanceCreated,
    ...partial
  })
  const matches = (r: Row, where: Where) =>
    r.pushedAt === where.pushedAt &&
    (where.id === undefined || where.id.in.includes(r.id))

  beforeEach(async () => {
    sendToUsers = jest.fn(async () => undefined)
    rows = []

    const prisma = {
      notification: {
        findMany: jest.fn(async ({ where }: { where: Where }) =>
          rows.filter((r) => matches(r, where)).map((r) => ({ ...r }))
        ),
        updateMany: jest.fn(
          async ({
            where,
            data
          }: {
            where: Where
            data: { pushedAt: Date }
          }) => {
            const hit = rows.filter((r) => matches(r, where))
            hit.forEach((r) => (r.pushedAt = data.pushedAt))
            return { count: hit.length }
          }
        ),
        updateManyAndReturn: jest.fn(
          async ({
            where,
            data
          }: {
            where: Where
            data: { pushedAt: Date }
          }) => {
            const hit = rows.filter((r) => matches(r, where))
            hit.forEach((r) => (r.pushedAt = data.pushedAt))
            return hit.map((r) => ({ id: r.id }))
          }
        )
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushDeferredService,
        { provide: PrismaService, useValue: prisma },
        { provide: PushSender, useValue: { sendToUsers } }
      ]
    }).compile()
    service = module.get(PushDeferredService)
  })

  it("수신자가 아직 방해금지 중이면 그대로 둔다", async () => {
    rows = [row({ id: 1 })]

    await expect(service.flush(MIDNIGHT_KST)).resolves.toBe(0)

    expect(sendToUsers).not.toHaveBeenCalled()
    expect(rows[0]!.pushedAt).toBeNull()
  })

  it("방해금지를 꺼 둔 사람 것은 한밤중에도 보낸다", async () => {
    rows = [
      row({ id: 1, recipientId: 3 }),
      row({
        id: 2,
        recipientId: 4,
        recipient: recipient(4, { quietHoursEnabled: false })
      })
    ]

    await expect(service.flush(MIDNIGHT_KST)).resolves.toBe(1)

    expect(sendToUsers).toHaveBeenCalledWith([4], expect.anything())
    expect(rows.map((r) => r.pushedAt)).toEqual([null, MIDNIGHT_KST])
  })

  it("아침이 되면 미뤄 둔 알림을 처리됨으로 찍은 뒤 수신자마다 보낸다", async () => {
    rows = [
      row({ id: 1, recipientId: 3 }),
      row({ id: 2, recipientId: 4, recipient: recipient(4) })
    ]

    await expect(service.flush(MORNING_KST)).resolves.toBe(2)

    expect(sendToUsers.mock.calls.map((c) => c[0])).toEqual([[3], [4]])
    expect(sendToUsers.mock.calls[0]![1]).toMatchObject({
      title: "새 공연",
      href: "/performances/1/teams"
    })
    expect(rows.map((r) => r.pushedAt)).toEqual([MORNING_KST, MORNING_KST])
  })

  it("그새 읽었거나 하루 지났거나 유형을 끈 알림은 보내지 않고 닫는다", async () => {
    rows = [
      row({ id: 1, readAt: new Date("2026-10-16T20:00:00Z") }),
      row({ id: 2, createdAt: new Date("2026-10-15T20:00:00Z") }),
      row({
        id: 3,
        recipient: recipient(3, {
          mutedNotificationTypes: ["PERFORMANCE_CREATED"]
        })
      }),
      row({ id: 4 })
    ]

    await expect(service.flush(MORNING_KST)).resolves.toBe(1)

    expect(sendToUsers).toHaveBeenCalledTimes(1)
    expect(rows.every((r) => r.pushedAt === MORNING_KST)).toBe(true)
  })

  it("깨진 payload는 보내지 않고 닫으며 집계에서도 뺀다", async () => {
    rows = [row({ id: 1, payload: {} }), row({ id: 2 })]

    await expect(service.flush(MORNING_KST)).resolves.toBe(1)

    expect(sendToUsers).toHaveBeenCalledTimes(1)
    expect(rows.every((r) => r.pushedAt === MORNING_KST)).toBe(true)
  })

  it("이미 보낸 알림은 건드리지 않는다", async () => {
    const earlier = new Date("2026-10-16T12:00:00Z")
    rows = [row({ id: 1, pushedAt: earlier })]

    await expect(service.flush(MORNING_KST)).resolves.toBe(0)

    expect(sendToUsers).not.toHaveBeenCalled()
    expect(rows[0]!.pushedAt).toBe(earlier)
  })
})
