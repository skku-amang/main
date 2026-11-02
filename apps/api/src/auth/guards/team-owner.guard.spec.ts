import { ExecutionContext } from "@nestjs/common"
import { ForbiddenError, NotFoundError } from "@repo/api-client"
import { PrismaService } from "../../prisma/prisma.service"
import { TeamOwnerGuard } from "./team-owner.guard"

const LEADER = 7
const OTHER = 8

const contextFor = (userId: number, teamId: string) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user: { sub: userId }, params: { id: teamId } })
    })
  }) as unknown as ExecutionContext

describe("TeamOwnerGuard", () => {
  const prisma = {
    user: { findUnique: jest.fn(async () => ({ isAdmin: false })) },
    team: {
      findUnique: jest.fn(async ({ where }: { where: { id: number } }) =>
        where.id === 10 ? { leaderId: LEADER } : null
      )
    }
  } as unknown as PrismaService
  const guard = new TeamOwnerGuard(prisma)

  // 공개 조회는 피드백 기간에 팀장을 가린다. 권한 검사는 가림과 무관하게 실제 팀장을 봐야 한다
  it("팀장이면 통과한다", async () => {
    await expect(guard.canActivate(contextFor(LEADER, "10"))).resolves.toBe(
      true
    )
  })

  it("팀장이 아니면 거부한다", async () => {
    await expect(guard.canActivate(contextFor(OTHER, "10"))).rejects.toThrow(
      ForbiddenError
    )
  })

  it("팀이 없으면 찾을 수 없다고 알린다", async () => {
    await expect(guard.canActivate(contextFor(LEADER, "99"))).rejects.toThrow(
      NotFoundError
    )
  })
})
