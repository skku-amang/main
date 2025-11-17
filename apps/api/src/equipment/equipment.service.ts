import { PrismaService } from "./../prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import { CreateEquipmentDto } from "./dto/create-equipment.dto"
import { UpdateEquipmentDto } from "./dto/update-equipment.dto"
import { Prisma, EquipCategory } from "@repo/database"
import { ConflictError, NotFoundError } from "@repo/api-client"
import * as path from "node:path"
import { v4 as uuidv4 } from "uuid"

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createEquipmentDto: CreateEquipmentDto,
    file?: Express.Multer.File
  ) {
    const imageUrl: string | undefined = undefined
    if (file) {
      // 파일 업로드 필요.
      const fileExt = path.extname(file.originalname)
      const fileName = `${uuidv4()}${fileExt}`

      // 파일 업로드 구현 필요
      // await this.minioService.upload ?
    }
    const equipment = await this.prisma.equipment.create({
      data: {
        ...createEquipmentDto,
        image: imageUrl
      }
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

  async update(
    id: number,
    updateEquipmentDto: UpdateEquipmentDto,
    file?: Express.Multer.File
  ) {
    try {
      const oldEquipment = await this.prisma.equipment.findUnique({
        where: { id },
        select: { image: true }
      })
      if (!oldEquipment)
        throw new NotFoundError(`ID가 ${id}인 장비를 찾을 수 없습니다.`)

      const oldImageUrl = oldEquipment?.image
      const imageUrl: string | undefined = undefined

      if (file) {
        // 파일 업로드 필요.
        const fileExt = path.extname(file.originalname)
        const fileName = `${uuidv4()}${fileExt}`

        // 파일 업로드 구현 필요
        // imageUrl =
      }
      if (oldImageUrl && imageUrl) {
        // oldImageUrl에 있는 기존 이미지 삭제 필요
      }
      const updateData: Prisma.EquipmentUpdateInput = {
        ...updateEquipmentDto,
        image: imageUrl
      }
      const equipment = await this.prisma.equipment.update({
        where: { id },
        data: updateData,
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
      const equipment = await this.prisma.equipment.delete({
        where: { id }
      })

      if (equipment.image) {
        // 이미지 삭제 로직 구현 필요
      }
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
