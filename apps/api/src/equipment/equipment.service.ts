import { PrismaService } from "./../prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import { CreateEquipmentDto } from "./dto/create-equipment.dto"
import { UpdateEquipmentDto } from "./dto/update-equipment.dto"
import { Prisma, EquipCategory } from "@repo/database"
import { NotFoundError } from "@repo/api-client"
import { ObjectStorageService } from "../object-storage/object-storage.service"
import { equipmentWithRentalLogInclude } from "@repo/shared-types"

@Injectable()
export class EquipmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly objectStorageService: ObjectStorageService
  ) {}

  async create(createEquipmentDto: CreateEquipmentDto) {
    return this.prisma.equipment.create({
      data: createEquipmentDto
    })
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
      include: equipmentWithRentalLogInclude
    })

    if (!equipment)
      throw new NotFoundError(`ID가 ${id}인 장비를 찾을 수 없습니다.`)

    return equipment
  }

  async update(id: number, updateEquipmentDto: UpdateEquipmentDto) {
    try {
      const oldEquipment = await this.prisma.equipment.findUnique({
        where: { id },
        select: { image: true }
      })
      if (!oldEquipment)
        throw new NotFoundError(`ID가 ${id}인 장비를 찾을 수 없습니다.`)

      const oldImageUrl = oldEquipment.image

      const updated = await this.prisma.equipment.update({
        where: { id },
        data: updateEquipmentDto,
        include: equipmentWithRentalLogInclude
      })

      if (
        "image" in updateEquipmentDto &&
        oldImageUrl &&
        oldImageUrl !== updateEquipmentDto.image
      ) {
        this.objectStorageService.deleteObjectSafely(oldImageUrl)
      }

      return updated
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
      const equipment = await this.prisma.equipment.delete({
        where: { id }
      })

      if (equipment.image) {
        this.objectStorageService.deleteObjectSafely(equipment.image)
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2025":
            throw new NotFoundError(`ID가 ${id}인 장비를 찾을 수 없습니다.`)
        }
      }
      throw error
    }
  }
}
