import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import {
  AuthError,
  ForbiddenError,
  NotFoundError,
  ValidationError
} from "@repo/api-client"
import { JwtPayload } from "@repo/shared-types"
import { PrismaService } from "../../prisma/prisma.service"

@Injectable()
export class RentalOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user as JwtPayload
    const rentalId = Number(request.params.id)

    if (!user) throw new AuthError("유저 정보가 없습니다.")

    if (Number.isNaN(rentalId))
      throw new ValidationError("유효하지 않은 대여 ID입니다.")

    if (user.isAdmin) return true

    const rental = await this.prisma.equipmentRental.findUnique({
      where: { id: rentalId },
      select: {
        users: {
          select: {
            id: true
          }
        }
      }
    })

    if (!rental)
      throw new NotFoundError(
        `ID가 ${rentalId}인 대여 기록을 찾을 수 없습니다.`
      )

    const isParticipant = rental.users.some((u) => u.id === user.sub)

    if (!isParticipant)
      throw new ForbiddenError("해당 대여 기록을 수정/삭제할 권한이 없습니다.")

    return true
  }
}
