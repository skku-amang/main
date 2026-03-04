import { Injectable } from "@nestjs/common"
import { ConflictError, NotFoundError } from "@repo/api-client"
import { Prisma } from "@repo/database"
import * as bcrypt from "bcrypt"
import { PrismaService } from "../prisma/prisma.service"
import { CreateUserDto } from "./dto/create-user.dto"
import { publicUserSelector } from "@repo/shared-types"
import { UpdateUserDto } from "./dto/update-user.dto"
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { sessions: sessionIds, ...restOfDto } = createUserDto
    const hashedPassword = await bcrypt.hash(restOfDto.password, 10)

    const image = `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(restOfDto.email)}`

    try {
      const user = await this.prisma.user.create({
        data: {
          ...restOfDto,
          password: hashedPassword,
          image,
          sessions: {
            connect: sessionIds.map((id) => ({ id }))
          }
        },
        select: publicUserSelector
      })

      return user
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target = (error.meta?.target as string[]) || []
        if (target.includes("email"))
          throw new ConflictError("이미 사용중인 이메일입니다.")
        if (target.includes("nickname"))
          throw new ConflictError("이미 사용중인 닉네임입니다.")
      }
      throw error
    }
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: publicUserSelector
    })

    return users
  }

  async findOne(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelector
    })

    if (!user)
      throw new NotFoundError(`ID가 ${userId}인 사용자를 찾을 수 없습니다.`)

    return user
  }

  async updateRefreshToken(userId: number, refreshToken: string | null) {
    const hashedRefreshToken = refreshToken
      ? await bcrypt.hash(refreshToken, 10)
      : null
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: hashedRefreshToken }
    })
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    const userExists = await this.prisma.user.count({
      where: { id: userId }
    })

    if (!userExists)
      throw new NotFoundError(`ID가 ${userId}인 사용자를 찾을 수 없습니다.`)

    const {
      sessions: sessionIds,
      generationId,
      password,
      ...restOfDto
    } = updateUserDto

    const updateData: Prisma.UserUpdateInput = {
      ...restOfDto
    }

    if (password) updateData.password = await bcrypt.hash(password, 10)

    if (generationId) updateData.generation = { connect: { id: generationId } }

    if (sessionIds !== undefined)
      updateData.sessions = { set: sessionIds.map((id) => ({ id })) }

    try {
      return await this.prisma.user.update({
        where: {
          id: userId
        },
        data: updateData,
        select: publicUserSelector
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target = (error.meta?.target as string[]) || []
        if (target.includes("email"))
          throw new ConflictError("이미 사용중인 이메일입니다.")
        if (target.includes("nickname"))
          throw new ConflictError("이미 사용중인 닉네임입니다.")
      }

      throw error
    }
  }

  async deleteUser(userId: number) {
    try {
      await this.prisma.user.delete({ where: { id: userId } })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025")
          throw new NotFoundError(`ID가 ${userId}인 사용자를 찾을 수 없습니다.`)

        if (error.code === "P2003") {
          const constraint = error.meta?.constraint as string

          if (constraint === "teams_leaderId_fkey")
            throw new ConflictError(
              "팀의 리더를 맡고 있는 사용자는 삭제할 수 없습니다. 먼저 팀 리더를 변경해주세요."
            )
        }
      }
      throw error
    }
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async findOneById(id: number) {
    return this.prisma.user.findUnique({ where: { id } })
  }
}
