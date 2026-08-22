import { ExecutionContext } from "@nestjs/common"
import { ForbiddenError } from "@repo/api-client"
import { PrismaService } from "../../prisma/prisma.service"
import { AdminGuard } from "./admin.guard"

const contextWithUser = (user: unknown): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ user }) })
  }) as ExecutionContext

describe("AdminGuard", () => {
  const findUnique = jest.fn()
  const prisma = { user: { findUnique } } as unknown as PrismaService
  const guard = new AdminGuard(prisma)

  beforeEach(() => {
    findUnique.mockReset()
  })

  it("DB가 관리자라고 하면 통과시킨다", async () => {
    findUnique.mockResolvedValue({ isAdmin: true })

    await expect(guard.canActivate(contextWithUser({ sub: 1 }))).resolves.toBe(
      true
    )
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { isAdmin: true }
    })
  })

  it("토큰에 isAdmin이 남아 있어도 DB가 아니라면 막는다", async () => {
    findUnique.mockResolvedValue({ isAdmin: false })

    await expect(
      guard.canActivate(contextWithUser({ sub: 1, isAdmin: true }))
    ).rejects.toThrow(ForbiddenError)
  })

  it("DB에 없는 유저는 막는다", async () => {
    findUnique.mockResolvedValue(null)

    await expect(
      guard.canActivate(contextWithUser({ sub: 999 }))
    ).rejects.toThrow(ForbiddenError)
  })

  it("인증 정보가 없으면 DB를 조회하지 않고 막는다", async () => {
    await expect(guard.canActivate(contextWithUser(undefined))).rejects.toThrow(
      ForbiddenError
    )
    expect(findUnique).not.toHaveBeenCalled()
  })
})
