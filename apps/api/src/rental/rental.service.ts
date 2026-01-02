import { Injectable } from "@nestjs/common"
import { CreateRentalDto } from "./dto/create-rental.dto"
import { UpdateRentalDto } from "./dto/update-rental.dto"
import { PrismaService } from "../prisma/prisma.service"
import { ConflictError, NotFoundError } from "@repo/api-client"
import { Prisma } from "@repo/database"

@Injectable()
export class RentalService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRentalDto: CreateRentalDto) {
    const { startAt, endAt, equipmentId, title, userIds } = createRentalDto
    const existingRental = await this.prisma.equipmentRental.findFirst({
      where: {
        equipmentId: createRentalDto.equipmentId,
        AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }]
      }
    })

    if (existingRental)
      throw new ConflictError("해당 시간에 이미 예약된 장비입니다.")

    return this.prisma.equipmentRental.create({
      data: {
        startAt,
        endAt,
        title,
        equipment: {
          connect: {
            id: equipmentId
          }
        },
        users: {
          connect: userIds.map((userId) => ({ id: userId }))
        }
      },
      include: {
        equipment: true,
        users: {
          select: {
            id: true,
            name: true,
            image: true,
            nickname: true,
            bio: true,
            generation: {
              select: { order: true }
            }
          }
        }
      }
    })
  }

  async findAll(
    type?: "room" | "item",
    equipmentId?: number,
    from?: Date,
    to?: Date
  ) {
    const now = new Date()
    let startDate = from
    let endDate = to

    if (!startDate && !endDate) {
      startDate = new Date(now.getFullYear(), now.getMonth())
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      endDate.setHours(23, 59, 59, 999)
    } else if (startDate && !endDate) {
      endDate = new Date(startDate)
      endDate.setMonth(startDate.getMonth() + 1)
    } else if (!startDate && endDate) {
      startDate = new Date(endDate)
      startDate.setMonth(endDate.getMonth() - 1)
    }

    const where: Prisma.EquipmentRentalWhereInput = {
      AND: [{ endAt: { gte: startDate }, startAt: { lte: endDate } }]
    }

    if (equipmentId) where.equipmentId = equipmentId

    if (type === "room") where.equipment = { category: "ROOM" }
    else if (type === "item") where.equipment = { category: { not: "ROOM" } }

    return this.prisma.equipmentRental.findMany({
      where: where,
      include: {
        equipment: true,
        users: {
          select: {
            id: true,
            name: true,
            image: true,
            nickname: true,
            bio: true,
            generation: {
              select: { order: true }
            }
          }
        }
      },
      orderBy: {
        startAt: "asc"
      }
    })
  }

  async findOne(id: number) {
    const rentalLog = await this.prisma.equipmentRental.findUnique({
      where: { id },
      include: {
        equipment: true,
        users: true
      }
    })

    if (!rentalLog)
      throw new NotFoundError(`ID가 ${id}인 대여 기록을 찾을 수 없습니다.`)

    return rentalLog
  }

  async update(id: number, updateRentalDto: UpdateRentalDto) {
    const oldRental = await this.prisma.equipmentRental.findUnique({
      where: { id }
    })

    if (!oldRental)
      throw new NotFoundError(`ID가 ${id}인 대여 기록을 찾을 수 없습니다.`)

    const newEquipmentID = updateRentalDto.equipmentId ?? oldRental.equipmentId
    const newStartAt = updateRentalDto.startAt ?? oldRental.startAt
    const newEndAt = updateRentalDto.endAt ?? oldRental.endAt

    if (newStartAt >= newEndAt)
      throw new ConflictError("대여 종료 시간은 시작 시간보다 뒤여야 합니다.")

    const isTimeChanged =
      updateRentalDto.startAt ||
      updateRentalDto.endAt ||
      updateRentalDto.equipmentId

    if (isTimeChanged) {
      const confilct = await this.prisma.equipmentRental.findFirst({
        where: {
          equipmentId: newEquipmentID,
          AND: [
            { id: { not: id } },
            { startAt: { lt: newEndAt } },
            { endAt: { gt: newStartAt } }
          ]
        }
      })

      if (confilct)
        throw new ConflictError("해당 시간에 이미 예약된 장비입니다.")
    }

    return this.prisma.equipmentRental.update({
      where: { id },
      data: {
        title: updateRentalDto.title,
        startAt: updateRentalDto.startAt,
        endAt: updateRentalDto.endAt,
        equipmentId: newEquipmentID,
        users: updateRentalDto.userIds
          ? {
              set: updateRentalDto.userIds.map((userId) => ({ id: userId }))
            }
          : undefined
      },
      include: {
        equipment: true,
        users: true
      }
    })
  }

  async remove(id: number) {
    try {
      await this.prisma.equipmentRental.delete({
        where: { id }
      })
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new NotFoundError(`ID가 ${id}인 대여 기록을 찾을 수 없습니다.`)
        }
      }
      throw err
    }
  }
}
