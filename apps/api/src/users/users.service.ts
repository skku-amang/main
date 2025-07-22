import {
  ConflictException,
  Injectable,
  InternalServerErrorException
} from "@nestjs/common"
import { Prisma } from "@repo/database"
import { CreateUserDto } from "@repo/shared-types"
import * as bcrypt from "bcrypt"
import { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)

    try {
      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword
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
          throw new ConflictException("이미 사용중인 이메일입니다.")
        if (target.includes("nickname"))
          throw new ConflictException("이미 사용중인 닉네임입니다.")
      }
      // RFC 7807 적용 시, throw error; 로 변경 필요
      throw new InternalServerErrorException()
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
