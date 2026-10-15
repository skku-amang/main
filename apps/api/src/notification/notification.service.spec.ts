import { Test, TestingModule } from "@nestjs/testing"
import { NotFoundError } from "@repo/api-client"
import { NotificationService } from "./notification.service"
import { PrismaService } from "../prisma/prisma.service"

type Row = {
  id: number
  recipientId: number
  readAt: Date | null
  type: "PERFORMANCE_CREATED"
  payload: { performanceId: number; performanceName: string }
  createdAt: Date
}

const row = (id: number, recipientId: number, readAt: Date | null): Row => ({
  id,
  recipientId,
  readAt,
  type: "PERFORMANCE_CREATED",
  payload: { performanceId: 1, performanceName: "공연" },
  createdAt: new Date("2026-10-01")
})

/** 최소한의 in-memory notification 테이블. where/orderBy/take 의미를 흉내 낸다. */
function fakeNotificationTable(rows: Row[]) {
  const matches = (
    row: Row,
    where: { recipientId?: number; id?: number | { lt: number }; readAt?: null }
  ) =>
    (where.recipientId === undefined ||
      row.recipientId === where.recipientId) &&
    (where.id === undefined ||
      (typeof where.id === "number"
        ? row.id === where.id
        : row.id < where.id.lt)) &&
    (where.readAt === undefined || row.readAt === where.readAt)

  return {
    findMany: jest.fn(({ where, take }) =>
      rows
        .filter((r) => matches(r, where))
        .sort((a, b) => b.id - a.id)
        .slice(0, take)
    ),
    findFirst: jest.fn(
      ({ where }) => rows.find((r) => matches(r, where)) ?? null
    ),
    count: jest.fn(({ where }) => rows.filter((r) => matches(r, where)).length),
    update: jest.fn(({ where, data }) => {
      const row = rows.find((r) => r.id === where.id)!
      Object.assign(row, data)
      return row
    }),
    updateMany: jest.fn(({ where, data }) => {
      const targets = rows.filter((r) => matches(r, where))
      targets.forEach((r) => Object.assign(r, data))
      return { count: targets.length }
    })
  }
}

async function makeService(rows: Row[]) {
  const table = fakeNotificationTable(rows)
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      NotificationService,
      { provide: PrismaService, useValue: { notification: table } }
    ]
  }).compile()
  return { service: module.get(NotificationService), table }
}

describe("NotificationService", () => {
  let service: NotificationService
  let table: ReturnType<typeof fakeNotificationTable>

  beforeEach(async () => {
    ;({ service, table } = await makeService([
      row(30, 1, null),
      row(20, 1, null),
      row(10, 1, new Date("2026-10-01")),
      row(5, 2, null)
    ]))
  })

  describe("findAll", () => {
    it("payload가 깨진 row는 건너뛰고 나머지를 돌려주며 cursor는 원본 기준", async () => {
      const { service } = await makeService([
        row(30, 1, null),
        { ...row(25, 1, null), payload: { broken: true } } as unknown as Row,
        row(20, 1, null)
      ])

      const result = await service.findAll(1, { limit: 2 })
      expect(result.items.map((i) => i.id)).toEqual([30])
      expect(result.nextCursor).toBe(25)
    })

    it("본인 알림만 최신순으로 limit만큼 주고 nextCursor를 돌려준다", async () => {
      const result = await service.findAll(1, { limit: 2 })
      expect(result.items.map((i) => i.id)).toEqual([30, 20])
      expect(result.nextCursor).toBe(20)
    })

    it("cursor 이후 페이지가 마지막이면 nextCursor는 null", async () => {
      const result = await service.findAll(1, { limit: 2, cursor: 20 })
      expect(result.items.map((i) => i.id)).toEqual([10])
      expect(result.nextCursor).toBeNull()
    })

    it("남의 알림은 포함하지 않는다", async () => {
      const result = await service.findAll(2, { limit: 10 })
      expect(result.items.map((i) => i.id)).toEqual([5])
    })
  })

  it("countUnread는 본인의 안 읽은 알림 수", async () => {
    await expect(service.countUnread(1)).resolves.toEqual({ count: 2 })
  })

  describe("markRead", () => {
    it("남의 알림은 404", async () => {
      await expect(service.markRead(1, 5)).rejects.toBeInstanceOf(NotFoundError)
    })

    it("읽음 처리하고, 다시 호출해도 처음 readAt을 유지한다", async () => {
      const first = await service.markRead(1, 30)
      expect(first.readAt).toBeInstanceOf(Date)

      const second = await service.markRead(1, 30)
      expect(second.readAt).toBe(first.readAt)
      expect(table.update).toHaveBeenCalledTimes(1)
    })
  })

  it("markAllRead는 본인의 안 읽은 알림만 읽음 처리하고 개수를 돌려준다", async () => {
    await expect(service.markAllRead(1)).resolves.toEqual({ count: 2 })
    await expect(service.countUnread(1)).resolves.toEqual({ count: 0 })
    await expect(service.countUnread(2)).resolves.toEqual({ count: 1 })
  })
})
