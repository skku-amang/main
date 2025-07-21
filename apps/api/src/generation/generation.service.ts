import {
  generationWithBasicUsers,
  generationWithPublicUsers
} from "./../prisma/selectors/generation.selector"
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common"
import { Prisma } from "@repo/database"
import { CreateGenerationDto, UpdateGenerationDto } from "shared-types"
import { PrismaService } from "../prisma/prisma.service"

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
        if (error.code === "P2002") {
          const target = (error.meta?.target as string[]) || []
          if (target.includes("order")) {
            throw new ConflictException(
              `해당 기수(${createGenerationDto.order})는 이미 존재합니다.`
            )
          }
          if (target.includes("leaderId")) {
            throw new ConflictException(
              `해당 유저(ID: ${createGenerationDto.leaderId})는 이미 다른 기수의 리더입니다.`
            )
          }
        }
        // RFC 7807 적용 시, throw error; 로 변경 필요
        throw new InternalServerErrorException(
          "기수 생성 중 서버 오류가 발생했습니다."
        )
      }
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
      throw new NotFoundException(
        `ID ${id}에 해당하는 기수를 찾을 수 없습니다.`
      )
    }
    return generation
  }

  async update(id: number, updateGenerationDto: UpdateGenerationDto) {
    await this.findOne(id) // Ensure the generation exists before updating
    try {
      await this.prisma.generation.update({
        where: { id },
        data: updateGenerationDto
      })
      return this.findOne(id)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          const target = (error.meta?.target as string[]) || []
          if (target.includes("order")) {
            throw new ConflictException(
              `해당 기수(${updateGenerationDto.order})는 이미 존재합니다.`
            )
          }
          if (target.includes("leaderId")) {
            throw new ConflictException(
              `해당 유저(ID: ${updateGenerationDto.leaderId})는 이미 다른 기수의 리더입니다.`
            )
          }
        }
        // RFC 7807 적용 시, throw error; 로 변경 필요
        throw new InternalServerErrorException(
          "기수 업데이트 중 서버 오류가 발생했습니다."
        )
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
          throw new ConflictException(
            "해당 기수에 소속된 유저가 있어 삭제할 수 없습니다."
          )
        }
      }
      // RFC 7807 적용 시, throw error; 로 변경 필요
      throw new InternalServerErrorException(
        "기수 삭제 중 서버 오류가 발생했습니다."
      )
    }
  }
}
