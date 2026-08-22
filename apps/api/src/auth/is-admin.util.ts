import { PrismaService } from "../prisma/prisma.service"

/**
 * 관리자 여부를 DB에서 확인한다.
 *
 * 토큰 claim이 아닌 DB를 보는 이유: claim은 발급 시점 스냅샷이라
 * 권한을 회수해도 토큰 수명만큼 관리자 행세가 가능하다.
 */
export const isUserAdmin = async (
  prisma: PrismaService,
  userId: number
): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true }
  })

  return user?.isAdmin === true
}
