import { Test, TestingModule } from "@nestjs/testing"
import { NotFoundError } from "@repo/api-client"
import { PrismaService } from "../prisma/prisma.service"
import { TeamBookmarkService } from "./team-bookmark.service"

type Row = { userId: number; teamId: number; createdAt: Date }

/** (userId, teamId) 복합 PK를 흉내 내는 in-memory team_bookmarks 테이블 */
function fakeBookmarkTable(initial: Row[], teamIds: number[]) {
  const rows = [...initial]
  const matches = (r: Row, where: Partial<Row>) =>
    (where.userId === undefined || r.userId === where.userId) &&
    (where.teamId === undefined || r.teamId === where.teamId)
  return {
    rows,
    team: {
      findUnique: jest.fn(async ({ where }) =>
        teamIds.includes(where.id) ? { id: where.id } : null
      )
    },
    teamBookmark: {
      findMany: jest.fn(async ({ where, orderBy }) => {
        const found = rows.filter((r) => matches(r, where))
        if (orderBy?.createdAt === "desc")
          found.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        return found
      }),
      upsert: jest.fn(async ({ where, create }) => {
        const key = where.userId_teamId
        const existing = rows.find((r) => matches(r, key))
        if (existing) return existing
        const row = { ...create, createdAt: new Date() }
        rows.push(row)
        return row
      }),
      deleteMany: jest.fn(async ({ where }) => {
        const before = rows.length
        for (let i = rows.length - 1; i >= 0; i--)
          if (matches(rows[i]!, where)) rows.splice(i, 1)
        return { count: before - rows.length }
      })
    }
  }
}

describe("TeamBookmarkService", () => {
  let service: TeamBookmarkService
  let db: ReturnType<typeof fakeBookmarkTable>

  beforeEach(async () => {
    db = fakeBookmarkTable(
      [
        { userId: 1, teamId: 10, createdAt: new Date("2026-10-01") },
        { userId: 1, teamId: 11, createdAt: new Date("2026-10-02") },
        { userId: 2, teamId: 10, createdAt: new Date("2026-10-03") }
      ],
      [10, 11, 12]
    )
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamBookmarkService, { provide: PrismaService, useValue: db }]
    }).compile()
    service = module.get(TeamBookmarkService)
  })

  it("본인이 별표한 팀 id만 최근 별표 순으로 돌려준다", async () => {
    expect(await service.findTeamIds(1)).toEqual([11, 10])
  })

  it("별표를 추가하면 목록에 나타난다", async () => {
    await service.add(1, 12)
    expect(await service.findTeamIds(1)).toContain(12)
  })

  it("같은 팀을 두 번 별표해도 한 번만 남는다", async () => {
    await service.add(1, 10)
    expect(
      db.rows.filter((r) => r.userId === 1 && r.teamId === 10)
    ).toHaveLength(1)
  })

  it("없는 팀은 별표할 수 없다", async () => {
    await expect(service.add(1, 999)).rejects.toThrow(NotFoundError)
  })

  it("별표 해제는 본인 것만 지운다", async () => {
    await service.remove(1, 10)
    expect(await service.findTeamIds(1)).toEqual([11])
    expect(await service.findTeamIds(2)).toEqual([10])
  })

  it("별표하지 않은 팀을 해제해도 오류 없이 넘어간다", async () => {
    await expect(service.remove(1, 12)).resolves.toBeUndefined()
  })
})
