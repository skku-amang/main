import { Injectable } from "@nestjs/common"
import { CreateSessionDto } from "./dto/create-session.dto"
import { UpdateSessionDto } from "./dto/update-session.dto"
import { PrismaService } from "../prisma/prisma.service"
import {
  NotFoundError,
  ConflictError,
  UnprocessableEntityError
} from "@repo/api-client"
import { Prisma } from "@repo/database"
import {
  sessionWithBasicUsers,
  sessionWithPublicUsers
} from "../prisma/selectors/session.selector"

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createSessionDto: CreateSessionDto) {
    try {
      const session = await this.prisma.session.create({
        data: createSessionDto
      })
      return this.findOne(session.id)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2002":
            // P2002: Unique constraint failed
            const target = (error.meta?.target as string[]) || []
            if (target.includes("name")) {
              throw new ConflictError(
                `세션 이름(${createSessionDto.name})은 이미 존재합니다.`
              )
            }
            if (target.includes("leaderId")) {
              throw new ConflictError(
                `해당 유저(ID: ${createSessionDto.leaderId})는 이미 다른 세션의 리더입니다.`
              )
            }
            break
          case "P2025":
            // P2025: An operation failed because it depends on one or more records that were required but not found.
            throw new UnprocessableEntityError("리더 ID가 유효하지 않습니다.")
        }
      }
      throw error
    }
  }

  findAll() {
    return this.prisma.session.findMany({
      select: sessionWithBasicUsers,
      orderBy: {
        name: "asc"
      }
    })
  }

  async findOne(id: number) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      select: sessionWithPublicUsers
    })
    if (!session) {
      throw new NotFoundError(`${id}에 해당하는 세션을 찾을 수 없습니다.`)
    }
    return session
  }

  async update(id: number, updateSessionDto: UpdateSessionDto) {
    await this.findOne(id) // 존재 여부 확인
    try {
      // DTO에서 관계성 필드와 관련 없는 필드 분리
      const { leaderId, users, ...scalarData } = updateSessionDto
      const updatePayload: Prisma.SessionUpdateInput = {
        ...scalarData
      }

      // leaderId가 존재하는 경우 관계성 필드 업데이트
      if (leaderId !== undefined) {
        updatePayload.leader =
          leaderId === null
            ? { disconnect: true }
            : { connect: { id: leaderId } }
      }

      // users가 존재하는 경우 관계성 필드 업데이트
      if (users !== undefined) {
        updatePayload.users = {
          set: users.map((userId) => ({ id: userId }))
        }
      }

      await this.prisma.session.update({
        where: { id },
        data: updatePayload
      })
      return this.findOne(id)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: Unique constraint failed
        switch (error.code) {
          case "P2002":
            const target = (error.meta?.target as string[]) || []
            if (target.includes("name")) {
              throw new ConflictError(
                `세션 이름(${updateSessionDto.name})은 이미 존재합니다.`
              )
            }
            if (target.includes("leaderId")) {
              throw new ConflictError(
                `해당 유저(ID: ${updateSessionDto.leaderId})는 이미 다른 세션의 리더입니다.`
              )
            }
            break
          case "P2025":
            // P2025: An operation failed because it depends on one or more records that were required but not found.
            throw new UnprocessableEntityError(
              "리더 ID 혹은 사용자 ID가 유효하지 않습니다."
            )
        }
      }
      throw error
    }
  }

  async remove(id: number) {
    const session = await this.findOne(id) // 존재 여부 확인
    try {
      await this.prisma.session.delete({
        where: { id }
      })
      return session
    } catch (error) {
      throw error
    }
  }
}
