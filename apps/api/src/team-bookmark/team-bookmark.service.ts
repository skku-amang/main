import { Injectable } from "@nestjs/common"
import { NotFoundError } from "@repo/api-client"
import { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class TeamBookmarkService {
  constructor(private readonly prisma: PrismaService) {}

  async findTeamIds(userId: number) {
    const bookmarks = await this.prisma.teamBookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    })
    return bookmarks.map((b) => b.teamId)
  }

  async add(userId: number, teamId: number) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } })
    if (!team)
      throw new NotFoundError(`ID가 ${teamId}인 팀을 찾을 수 없습니다.`)

    await this.prisma.teamBookmark.upsert({
      where: { userId_teamId: { userId, teamId } },
      create: { userId, teamId },
      update: {}
    })
  }

  async remove(userId: number, teamId: number) {
    await this.prisma.teamBookmark.deleteMany({ where: { userId, teamId } })
  }
}
