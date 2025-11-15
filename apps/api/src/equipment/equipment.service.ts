import { PrismaService } from "./../prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import { CreateEquipmentDto } from "./dto/create-equipment.dto"
import { UpdateEquipmentDto } from "./dto/update-equipment.dto"
import { Prisma, EquipCategory } from "@repo/database"
import { ConflictError, NotFoundError } from "@repo/api-client"

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEquipmentDto: CreateEquipmentDto) {
    const equipment = await this.prisma.equipment.create({
      data: createEquipmentDto
    })

    return this.findOne(equipment.id)
  }

  async findAll(type?: string) {
    const whereCondition: Prisma.EquipmentWhereInput = {}
    if (type) {
      switch (type) {
        case "room":
          whereCondition.category = EquipCategory.ROOM
          break
        case "item":
          whereCondition.category = { not: EquipCategory.ROOM }
          break
      }
    }

    return this.prisma.equipment.findMany({
      where: whereCondition
    })
  }

  async findOne(id: number) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id },
      include: { rentalLogs: true }
    })

    if (!equipment)
      throw new NotFoundError(`ID가 ${id}인 장비를 찾을 수 없습니다.`)

    return equipment
  }

  async update(id: number, updateEquipmentDto: UpdateEquipmentDto) {
    try {
      const equipment = await this.prisma.equipment.update({
        where: { id },
        data: updateEquipmentDto,
        include: {
          rentalLogs: true
        }
      })

      return equipment
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025")
          throw new NotFoundError(`ID가 ${id}인 장비를 찾을 수 없습니다.`)
      }
      throw error
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.equipment.delete({
        where: { id }
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2003":
            throw new ConflictError(
              `해당 장비는 대여 기록이 존재하여 삭제할 수 없습니다.`
            )
          case "P2025":
            throw new NotFoundError(`ID가 ${id}인 장비를 찾을 수 없습니다.`)
        }
      }
      throw error
    }
  }
}
