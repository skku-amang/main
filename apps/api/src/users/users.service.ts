import { Injectable } from "@nestjs/common"
import { ConflictError } from "@repo/api-client"
import { Prisma } from "@repo/database"
import * as bcrypt from "bcrypt"
import { PrismaService } from "../prisma/prisma.service"
import { CreateUserDto } from "./dto/create-user.dto"

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { sessions: sessionIds, ...restOfDto } = createUserDto
    const hashedPassword = await bcrypt.hash(restOfDto.password, 10)

    try {
      const user = await this.prisma.user.create({
        data: {
          ...restOfDto,
          password: hashedPassword,
          sessions: {
            connect: sessionIds.map((id) => ({ id }))
          }
        }
      })

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user
      return result
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

  async updateRefreshToken(userId: number, refreshToken: string | null) {
    const hashedRefreshToken = refreshToken
      ? await bcrypt.hash(refreshToken, 10)
      : null
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: hashedRefreshToken }
    })
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async findOneById(id: number) {
    return this.prisma.user.findUnique({ where: { id } })
  }
}
