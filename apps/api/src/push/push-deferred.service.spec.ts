import { Test, TestingModule } from "@nestjs/testing"
import { PrismaService } from "../prisma/prisma.service"
import { PushDeferredService } from "./push-deferred.service"
import { PushSender } from "./push.sender"

const MORNING_KST = new Date("2026-10-17T00:05:00Z") // 10-17 09:05 KST
const MIDNIGHT_KST = new Date("2026-10-16T15:30:00Z") // 10-17 00:30 KST

type Row = {
  id: number
  recipientId: number
  type: string
  payload: Record<string, unknown>
  readAt: Date | null
  createdAt: Date
  pushedAt: Date | null
}

const performanceCreated = {
  type: "PERFORMANCE_CREATED",
  payload: { performanceId: 1, performanceName: "봄 공연" }
}

describe("PushDeferredService.flush", () => {
  let service: PushDeferredService
  let sendToUsers: jest.Mock
  let rows: Row[]

  const row = (partial: Partial<Row> & { id: number }): Row => ({
    recipientId: 3,
    readAt: null,
    createdAt: new Date("2026-10-16T16:00:00Z"), // 10-17 01:00 KST, 방해금지 중 생성
    pushedAt: null,
    ...performanceCreated,
    ...partial
  })

  beforeEach(async () => {
    sendToUsers = jest.fn(async () => undefined)
    rows = []

    const matches = (
      r: Row,
      where: {
        pushedAt?: null
        id?: { in: number[] }
        OR?: { readAt?: { not: null }; createdAt?: { lt: Date } }[]
      }
    ) =>
      (where.pushedAt === undefined || r.pushedAt === where.pushedAt) &&
      (where.id === undefined || where.id.in.includes(r.id)) &&
      (where.OR === undefined ||
        where.OR.some(
          (c) =>
            (c.readAt && r.readAt !== null) ||
            (c.createdAt && r.createdAt < c.createdAt.lt)
        ))

    const prisma = {
      notification: {
        findMany: jest.fn(
          async ({ where }: { where: Parameters<typeof matches>[1] }) =>
            rows.filter((r) => matches(r, where))
        ),
        updateMany: jest.fn(
          async ({
            where,
            data
          }: {
            where: Parameters<typeof matches>[1]
            data: { pushedAt: Date }
          }) => {
            const hit = rows.filter((r) => matches(r, where))
            hit.forEach((r) => (r.pushedAt = data.pushedAt))
            return { count: hit.length }
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

  it("방해금지 중엔 아무것도 하지 않는다", async () => {
    rows = [row({ id: 1 })]

    await expect(service.flush(MIDNIGHT_KST)).resolves.toBe(0)

    expect(sendToUsers).not.toHaveBeenCalled()
    expect(rows[0]!.pushedAt).toBeNull()
  })

  it("아침이 되면 미뤄 둔 알림을 수신자마다 보내고 발송 시각을 남긴다", async () => {
    rows = [row({ id: 1, recipientId: 3 }), row({ id: 2, recipientId: 4 })]

    await expect(service.flush(MORNING_KST)).resolves.toBe(2)

    expect(sendToUsers.mock.calls.map((c) => c[0])).toEqual([[3], [4]])
    expect(sendToUsers.mock.calls[0]![1]).toMatchObject({
      title: "새 공연",
      href: "/performances/1/teams"
    })
    expect(rows.map((r) => r.pushedAt)).toEqual([MORNING_KST, MORNING_KST])
  })

  it("그새 읽었거나 하루 지난 알림은 보내지 않고 닫는다", async () => {
    rows = [
      row({ id: 1, readAt: new Date("2026-10-16T20:00:00Z") }),
      row({ id: 2, createdAt: new Date("2026-10-15T20:00:00Z") }),
      row({ id: 3 })
    ]

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
