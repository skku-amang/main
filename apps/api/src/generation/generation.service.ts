import { Injectable } from "@nestjs/common"
import {
  NotFoundError,
  ConflictError,
  UnprocessableEntityError
} from "@repo/api-client"
import { Prisma } from "@repo/database"
import { CreateGenerationDto, UpdateGenerationDto } from "@repo/shared-types"
import { PrismaService } from "../prisma/prisma.service"
import {
  generationWithBasicUsers,
  generationWithPublicUsers
} from "./../prisma/selectors/generation.selector"

@Injectable()
export class GenerationService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createGenerationDto: CreateGenerationDto) {
    try {
      const generation = await this.prisma.generation.create({
        data: createGenerationDto
      })
      return this.findOne(generation.id)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2002":
            // P2002: Unique constraint failed
            const target = (error.meta?.target as string[]) || []
            if (target.includes("order")) {
              throw new ConflictError(
                `해당 기수(${createGenerationDto.order})는 이미 존재합니다.`
              )
            }
            if (target.includes("leaderId")) {
              throw new ConflictError(
                `해당 유저(ID: ${createGenerationDto.leaderId})는 이미 다른 기수의 리더입니다.`
              )
            }
            break
          case "P2025":
            // P2025: An operation failed because it depends on one or more records that were required but not found.
            throw new UnprocessableEntityError(
              "존재하지 않는 리더 ID 혹은 사용자 ID가 포함되어 있습니다."
            )
        }
      }
      throw error
    }
  }

  async findAll() {
    const generations = await this.prisma.generation.findMany({
      select: generationWithBasicUsers,
      orderBy: {
        order: "desc"
      }
    })

    return generations
  }

  async findOne(id: number) {
    const generation = await this.prisma.generation.findUnique({
      where: { id },
      select: generationWithPublicUsers
    })
    if (!generation) {
      throw new NotFoundError(`ID ${id}에 해당하는 기수를 찾을 수 없습니다.`)
    }
    return generation
  }

  async update(id: number, updateGenerationDto: UpdateGenerationDto) {
    await this.findOne(id) // Ensure the generation exists before updating
    try {
      // DTO에서 관계성 필드와 관련 없는 필드 분리
      const { leaderId, users, ...scalarData } = updateGenerationDto
      const updatePayload: Prisma.GenerationUpdateInput = {
        ...scalarData
      }

      if (leaderId !== undefined) {
        // leaderId가 존재하는 경우 관계성 필드 업데이트
        updatePayload.leader =
          leaderId === null
            ? { disconnect: true }
            : { connect: { id: leaderId } }
      }

      if (users !== undefined) {
        // users가 존재하는 경우 관계성 필드 업데이트
        updatePayload.users = {
          set: users.map((userId) => ({ id: userId }))
        }
      }

      await this.prisma.generation.update({
        where: { id },
        data: updatePayload
      })
      return this.findOne(id)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2002":
            // P2002: Unique constraint failed
            const target = (error.meta?.target as string[]) || []
            if (target.includes("order")) {
              throw new ConflictError(
                `해당 기수(${updateGenerationDto.order})는 이미 존재합니다.`
              )
            }
            if (target.includes("leaderId")) {
              throw new ConflictError(
                `해당 유저(ID: ${updateGenerationDto.leaderId})는 이미 다른 기수의 리더입니다.`
              )
            }
            break
          case "P2025":
            // P2025: An operation failed because it depends on one or more records that were required but not found.
            throw new UnprocessableEntityError(
              "존재하지 않는 리더 ID 혹은 사용자 ID가 포함되어 있습니다."
            )
        }
        throw error
      }
    }
  }
  async remove(id: number) {
    const generation = await this.findOne(id) // Ensure the generation exists before removing
    try {
      await this.prisma.generation.delete({
        where: { id }
      })
      return generation
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw new ConflictError(
            "해당 기수에 소속된 유저가 있어 삭제할 수 없습니다."
          )
        }
      }
      throw error
    }
  }
}
