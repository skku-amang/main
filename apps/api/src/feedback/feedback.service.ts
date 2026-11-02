import { Injectable } from "@nestjs/common"
import {
  ForbiddenError,
  NotFoundError,
  ValidationError
} from "@repo/api-client"
import { Prisma } from "@repo/database"
import {
  FeedbackContext,
  getPerformanceStage,
  isEligibleReviewer,
  MyFeedbackSummary,
  UpsertFeedback
} from "@repo/shared-types"
import { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  /** 지금 기준의 단계·대상 팀·팀별 소속자(팀장 ∪ 세션 멤버) */
  private async loadPerformance(performanceId: number) {
    const performance = await this.prisma.performance.findUnique({
      where: { id: performanceId },
      select: {
        id: true,
        recruitStartAt: true,
        recruitEndAt: true,
        feedbackStartAt: true,
        feedbackEndAt: true,
        decidedAt: true,
        endAt: true,
        teams: {
          select: {
            id: true,
            leaderId: true,
            recordingUrl: true,
            teamSessions: { select: { members: { select: { userId: true } } } }
          }
        }
      }
    })
    if (!performance)
      throw new NotFoundError(
        `ID가 ${performanceId}인 공연을 찾을 수 없습니다.`
      )

    const ctx: FeedbackContext = {
      targetTeamIds: performance.teams
        .filter((t) => t.recordingUrl !== null)
        .map((t) => t.id),
      membersByTeam: Object.fromEntries(
        performance.teams.map((t) => [
          t.id,
          [
            t.leaderId,
            ...t.teamSessions.flatMap((s) => s.members.map((m) => m.userId))
          ]
        ])
      )
    }
    return { stage: getPerformanceStage(performance, new Date()), ctx }
  }

  private ownTeamIds(userId: number, ctx: FeedbackContext) {
    return Object.entries(ctx.membersByTeam)
      .filter(([, members]) => members.includes(userId))
      .map(([teamId]) => Number(teamId))
  }

  async getMine(
    performanceId: number,
    userId: number
  ): Promise<MyFeedbackSummary> {
    const { stage, ctx } = await this.loadPerformance(performanceId)
    const feedbacks = await this.prisma.feedback.findMany({
      where: { reviewerId: userId, team: { performanceId } },
      select: {
        teamId: true,
        teamScore: true,
        individualScore: true,
        preferenceScore: true,
        comment: true,
        updatedAt: true
      }
    })

    return {
      stage,
      eligible: isEligibleReviewer(userId, ctx),
      ownTeamIds: this.ownTeamIds(userId, ctx),
      targetTeamIds: ctx.targetTeamIds,
      feedbacks: feedbacks.map((f) => ({
        ...f,
        updatedAt: f.updatedAt.toISOString()
      }))
    }
  }

  async upsert(teamId: number, userId: number, data: UpsertFeedback) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { performanceId: true }
    })
    if (!team)
      throw new NotFoundError(`ID가 ${teamId}인 팀을 찾을 수 없습니다.`)

    const { stage, ctx } = await this.loadPerformance(team.performanceId)
    if (stage !== "EVALUATION")
      throw new ForbiddenError("피드백 기간이 아닙니다.")
    if (!isEligibleReviewer(userId, ctx))
      throw new ForbiddenError(
        "이 공연의 피드백 대상 팀 소속자만 피드백할 수 있습니다."
      )
    if (this.ownTeamIds(userId, ctx).includes(teamId))
      throw new ForbiddenError("본인 팀에는 피드백할 수 없습니다.")
    if (!ctx.targetTeamIds.includes(teamId))
      throw new ValidationError("녹음본을 낸 팀에만 피드백할 수 있습니다.")

    const where = { teamId_reviewerId: { teamId, reviewerId: userId } }
    try {
      return await this.prisma.feedback.upsert({
        where,
        create: { teamId, reviewerId: userId, ...data },
        update: data
      })
    } catch (error) {
      // 버튼 연타로 같은 행을 동시에 만들려다 한쪽이 졌다 — 이미 생긴 행을 고친다
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
        return this.prisma.feedback.update({ where, data })
      throw error
    }
  }
}
