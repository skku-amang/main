import { Injectable } from "@nestjs/common"
import { CreatePerformanceDto } from "./dto/create-performance.dto"
import { UpdatePerformanceDto } from "./dto/update-performance.dto"
import { PrismaService } from "../prisma/prisma.service"
import { publicUser } from "../prisma/selectors/user.selector"
import { NotFoundError } from "@repo/api-client"

@Injectable()
export class PerformanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPerformanceDto: CreatePerformanceDto) {
    await this.prisma.performance.create({
      data: createPerformanceDto
    })
  }

  async findAll() {
    const performances = await this.prisma.performance.findMany()
    return performances
  }

  async findTeamsByPerformanceId(id: number) {
    const performance = await this.prisma.performance.findUnique({
      where: { id },
      include: {
        teams: {
          include: {
            teamSessions: {
              include: {
                session: true,
                members: {
                  include: {
                    user: {
                      select: publicUser
                    }
                  },
                  orderBy: { index: "asc" }
                }
              }
            },
            leader: { select: publicUser }
          }
        }
      }
    })

    if (!performance)
      throw new NotFoundError(`ID가 ${id}인 공연을 찾을 수 없습니다.`)
    return performance.teams
  }

  findOne(id: number) {
    return `This action returns a #${id} performance`
  }

  update(id: number, updatePerformanceDto: UpdatePerformanceDto) {
    return `This action updates a #${id} performance`
  }

  remove(id: number) {
    return `This action removes a #${id} performance`
  }
}
