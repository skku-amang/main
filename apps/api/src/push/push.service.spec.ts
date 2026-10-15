import { Test, TestingModule } from "@nestjs/testing"
import { PushService } from "./push.service"
import { PrismaService } from "../prisma/prisma.service"

type Row = {
  id: number
  userId: number
  endpoint: string
  p256dh: string
  auth: string
}

/** endpoint unique 제약을 흉내 내는 in-memory push_subscriptions 테이블 */
function fakeSubscriptionTable(initial: Row[]) {
  const rows = [...initial]
  let nextId = Math.max(0, ...rows.map((r) => r.id)) + 1
  return {
    rows,
    upsert: jest.fn(async ({ where, create, update }) => {
      const existing = rows.find((r) => r.endpoint === where.endpoint)
      if (existing) {
        Object.assign(existing, update)
        return existing
      }
      const row = { id: nextId++, ...create }
      rows.push(row)
      return row
    }),
    deleteMany: jest.fn(async ({ where }) => {
      const before = rows.length
      for (let i = rows.length - 1; i >= 0; i--) {
        const r = rows[i]!
        if (r.endpoint === where.endpoint && r.userId === where.userId)
          rows.splice(i, 1)
      }
      return { count: before - rows.length }
    })
  }
}

const sub = (endpoint: string) => ({
  endpoint,
  keys: { p256dh: "p", auth: "a" }
})

describe("PushService", () => {
  let service: PushService
  let table: ReturnType<typeof fakeSubscriptionTable>

  beforeEach(async () => {
    table = fakeSubscriptionTable([
      {
        id: 1,
        userId: 2,
        endpoint: "https://push/other",
        p256dh: "p",
        auth: "a"
      }
    ])
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushService,
        { provide: PrismaService, useValue: { pushSubscription: table } }
      ]
    }).compile()
    service = module.get(PushService)
  })

  it("같은 endpoint를 다시 등록하면 row는 하나고 소유자·키가 갱신된다", async () => {
    await service.subscribe(1, sub("https://push/a"))
    await service.subscribe(3, {
      endpoint: "https://push/a",
      keys: { p256dh: "p2", auth: "a2" }
    })

    const mine = table.rows.filter((r) => r.endpoint === "https://push/a")
    expect(mine).toHaveLength(1)
    expect(mine[0]).toMatchObject({ userId: 3, p256dh: "p2", auth: "a2" })
  })

  it("남의 endpoint는 해제해도 지워지지 않는다", async () => {
    await expect(
      service.unsubscribe(1, { endpoint: "https://push/other" })
    ).resolves.toEqual({ count: 0 })
    expect(table.rows).toHaveLength(1)
  })

  it("내 endpoint는 해제되고 개수를 돌려준다", async () => {
    await service.subscribe(1, sub("https://push/a"))
    await expect(
      service.unsubscribe(1, { endpoint: "https://push/a" })
    ).resolves.toEqual({ count: 1 })
    expect(table.rows.some((r) => r.endpoint === "https://push/a")).toBe(false)
  })
})
