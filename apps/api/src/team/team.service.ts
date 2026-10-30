import { Injectable } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { CreateTeamDto } from "./dto/create-team.dto"
import { UpdateTeamDto } from "./dto/update-team.dto"
import { TeamApplicationDto } from "./dto/team-application.dto"
import { PrismaService } from "../prisma/prisma.service"
import { Prisma } from "@repo/database"
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  DuplicateApplicationError,
  PositionOccupiedError,
  SessionNotFoundError,
  NoApplicationFoundError,
  InvalidMemberIndexError,
  DuplicateMemberIndexError,
  DuplicateSessionUserError,
  DuplicateTeamSessionError,
  ReferencedEntityNotFoundError,
  PerformanceRecruitmentClosedError
} from "@repo/api-client"
import {
  getPerformanceStage,
  isTeamContentOpen,
  isTeamRosterOpen,
  PerformanceStage,
  SESSION_DISPLAY_NAME,
  teamWithBasicUsersInclude,
  teamWithPublicUsersInclude
} from "@repo/shared-types"
import * as Sentry from "@sentry/nestjs"
import { ObjectStorageService } from "../object-storage/object-storage.service"
import {
  TEAM_EVENTS,
  TeamCreatedEvent,
  TeamDeletedEvent,
  TeamLeaderChangedEvent,
  TeamMemberAddedEvent,
  TeamMemberRemovedEvent,
  TeamUpdatedEvent,
  changedTeamFields,
  diffRoster
} from "./team.events"

/** 세션·정원·자리 배정을 비교용 문자열로 — 같은 사람이 자리만 옮겨도 구성 변경으로 본다 */
const rosterSignature = (
  sessions: {
    sessionId: number
    capacity: number
    members: { userId: number; index: number }[]
  }[]
) =>
  JSON.stringify(
    [...sessions]
      .sort((a, b) => a.sessionId - b.sessionId)
      .map((s) => [
        s.sessionId,
        s.capacity,
        s.members.map((m) => `${m.userId}:${m.index}`).sort()
      ])
  )

@Injectable()
export class TeamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly objectStorageService: ObjectStorageService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  // 오류 안내에 내부 번호 대신 이름을 쓴다. 오류가 날 때만 조회한다
  private async sessionLabel(sessionId: number) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: { name: true }
    })
    return session ? SESSION_DISPLAY_NAME[session.name] : "해당"
  }

  private async userLabel(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    })
    return user?.name ?? "같은 부원"
  }
  async create(createTeamDto: CreateTeamDto, actorId: number) {
    const { leaderId, memberSessions, performanceId, ...scalarData } =
      createTeamDto

    await this.assertRosterOpen(performanceId, "팀 모집 기간이 아닙니다.")
    if (scalarData.isFreshmenFixed) await this.assertAdmin(actorId)

    if (memberSessions.length > 0) {
      for (const session of memberSessions) {
        const { capacity, sessionId, members } = session

        if (members.length === 0) continue

        const indexSet = new Set<number>()
        const userSet = new Set<number>()

        for (const member of members) {
          if (member.index < 1 || member.index > capacity) {
            throw new InvalidMemberIndexError(
              `${await this.sessionLabel(sessionId)} 세션의 자리 번호(${member.index})는 1부터 정원(${capacity}명)까지만 쓸 수 있습니다.`
            )
          }
          if (indexSet.has(member.index)) {
            throw new DuplicateMemberIndexError(
              `${await this.sessionLabel(sessionId)} 세션의 ${member.index}번 자리가 두 번 들어 있습니다.`
            )
          }
          if (userSet.has(member.userId)) {
            throw new DuplicateSessionUserError(
              `${await this.userLabel(member.userId)}님이 ${await this.sessionLabel(sessionId)} 세션에 두 번 들어 있습니다.`
            )
          }
          indexSet.add(member.index)
          userSet.add(member.userId)
        }
      }
    }

    const createPayload: Prisma.TeamCreateInput = {
      ...scalarData,
      leader: { connect: { id: leaderId } },
      Performance: { connect: { id: performanceId } }
    }

    if (memberSessions && memberSessions.length > 0) {
      createPayload.teamSessions = {
        create: memberSessions.map((session) => {
          const { capacity, sessionId, members } = session
          const teamSessionCreate: Prisma.TeamSessionCreateWithoutTeamInput = {
            capacity,
            session: {
              connect: { id: sessionId }
            }
          }

          if (members && members.length > 0) {
            teamSessionCreate.members = {
              create: members.map((member) => ({
                index: member.index,
                user: { connect: { id: member.userId } }
              }))
            }
          }

          return teamSessionCreate
        })
      }
    }

    try {
      const team = await this.prisma.team.create({
        data: createPayload
      })

      Sentry.metrics.count("team.formed", 1, {
        attributes: {
          performanceId: performanceId,
          sessionCount: memberSessions?.length ?? 0
        }
      })
      this.eventEmitter.emit(
        TEAM_EVENTS.CREATED,
        new TeamCreatedEvent(team.id, actorId)
      )

      return this.findOne(team.id)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2002":
            const target = (error.meta?.target as string[]) ?? []
            if (target.includes("teamId") && target.includes("sessionId"))
              throw new DuplicateTeamSessionError(
                "한 팀에 동일한 세션을 중복하여 추가할 수 없습니다."
              )
            throw new ConflictError(
              "이미 존재하는 데이터와 충돌이 발생했습니다."
            )
          case "P2003":
          case "P2025":
            throw new ReferencedEntityNotFoundError(
              "존재하지 않는 팀장, 세션, 공연, 또는 유저를 팀에 추가할 수 없습니다."
            )
        }
      }
      throw error
    }
  }

  async findAll() {
    const teams = await this.prisma.team.findMany({
      include: teamWithBasicUsersInclude
    })

    return teams
  }

  async findOne(id: number) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: teamWithPublicUsersInclude
    })
    if (!team) throw new NotFoundError(`ID가 ${id}인 팀을 찾을 수 없습니다.`)

    return team
  }

  async update(id: number, updateTeamDto: UpdateTeamDto, actorId: number) {
    const {
      leaderId,
      performanceId,
      memberSessions,
      description,
      image,
      songYoutubeVideoUrl,
      ...scalarData
    } = updateTeamDto

    const existingTeam = await this.prisma.team.findUnique({
      where: { id },
      include: { teamSessions: { include: { members: true } } }
    })
    if (!existingTeam)
      throw new NotFoundError(`ID가 ${id}인 팀을 찾을 수 없습니다.`)

    // 잠금 판정은 요청마다 공연 날짜로 계산한다 — 운영진이 날짜를 미루면 바로 풀린다
    const stage = await this.getStage(existingTeam.performanceId)
    if (stage && !isTeamContentOpen(stage))
      throw new PerformanceRecruitmentClosedError(
        "피드백 단계부터는 팀을 수정할 수 없습니다."
      )
    const rosterChanged =
      (leaderId !== undefined && leaderId !== existingTeam.leaderId) ||
      rosterSignature(existingTeam.teamSessions) !==
        rosterSignature(memberSessions)
    if (rosterChanged && stage && !isTeamRosterOpen(stage))
      throw new PerformanceRecruitmentClosedError(
        "모집이 끝나 팀 구성(멤버·정원·팀장)은 바꿀 수 없습니다."
      )
    if (
      scalarData.isFreshmenFixed !== undefined &&
      scalarData.isFreshmenFixed !== existingTeam.isFreshmenFixed
    )
      await this.assertAdmin(actorId)

    // 모집이 끝난 공연에서 빼내는 이동은 허용, 모집 중이 아닌 공연으로 들이는 이동만 차단
    if (
      performanceId !== undefined &&
      performanceId !== existingTeam.performanceId
    )
      await this.assertRosterOpen(
        performanceId,
        "팀 모집 중인 공연으로만 옮길 수 있습니다."
      )

    const oldImageUrl = existingTeam.image
    const changedFields = changedTeamFields(existingTeam, updateTeamDto)
    const roster = diffRoster(existingTeam.teamSessions, memberSessions)

    const prismaOperaions: Prisma.PrismaPromise<any>[] = []

    // 기존 세션과 새로운 세션 비교
    const existingSessionMap = new Map(
      existingTeam.teamSessions.map((s) => [s.sessionId, s])
    )
    const newSessionMap = new Map(memberSessions.map((s) => [s.sessionId, s]))

    // 세션 삭제 작업 진행
    const sessionsToDelete = existingTeam.teamSessions.filter(
      (s) => !newSessionMap.has(s.sessionId)
    )
    if (sessionsToDelete.length > 0) {
      prismaOperaions.push(
        this.prisma.teamSession.deleteMany({
          where: { id: { in: sessionsToDelete.map((s) => s.id) } }
        })
      )
    }

    // 세션 추가 및 업데이트 작업
    for (const newSession of memberSessions) {
      const { sessionId, capacity, members } = newSession
      const existingSession = existingSessionMap.get(sessionId)

      if (members.length > 0) {
        const indexSet = new Set<number>()
        const userSet = new Set<number>()

        for (const member of members) {
          if (member.index < 1 || member.index > capacity)
            throw new InvalidMemberIndexError(
              `${await this.sessionLabel(sessionId)} 세션의 자리 번호(${member.index})는 1부터 정원(${capacity}명)까지만 쓸 수 있습니다.`
            )
          if (indexSet.has(member.index))
            throw new DuplicateMemberIndexError(
              `${await this.sessionLabel(sessionId)} 세션의 ${member.index}번 자리가 두 번 들어 있습니다.`
            )
          if (userSet.has(member.userId))
            throw new DuplicateSessionUserError(
              `${await this.userLabel(member.userId)}님이 ${await this.sessionLabel(sessionId)} 세션에 두 번 들어 있습니다.`
            )
          userSet.add(member.userId)
          indexSet.add(member.index)
        }
      }

      if (existingSession) {
        // 같은 자리(index)에 그대로 있는 팀원은 지우지 않아야 참여 시각(createdAt)이 유지됨
        const isKept = (m: { userId: number; index: number }) =>
          existingSession.members.some(
            (e) => e.userId === m.userId && e.index === m.index
          )
        prismaOperaions.push(
          this.prisma.teamSession.update({
            where: { id: existingSession.id },
            data: {
              capacity: newSession.capacity,
              members: {
                deleteMany: {
                  NOT: {
                    OR: newSession.members
                      .filter(isKept)
                      .map((m) => ({ userId: m.userId, index: m.index }))
                  }
                },
                create: newSession.members
                  .filter((m) => !isKept(m))
                  .map((m) => ({
                    userId: m.userId,
                    index: m.index
                  }))
              }
            }
          })
        )
      } else {
        prismaOperaions.push(
          this.prisma.teamSession.create({
            data: {
              capacity: newSession.capacity,
              team: { connect: { id } },
              session: { connect: { id: newSession.sessionId } },
              members: {
                create: newSession.members.map((m) => ({
                  userId: m.userId,
                  index: m.index
                }))
              }
            }
          })
        )
      }
    }

    prismaOperaions.push(
      this.prisma.team.update({
        where: { id },
        data: {
          ...scalarData,
          description: description ?? null,
          image: image ?? null,
          songYoutubeVideoUrl: songYoutubeVideoUrl ?? null,
          leader: { connect: { id: leaderId } },
          ...(performanceId !== undefined && {
            Performance: { connect: { id: performanceId } }
          })
        }
      })
    )

    try {
      if (prismaOperaions.length > 0)
        await this.prisma.$transaction(prismaOperaions)

      if (image !== undefined && oldImageUrl && oldImageUrl !== image)
        this.objectStorageService.deleteObjectSafely(oldImageUrl)

      if (changedFields.length > 0)
        this.eventEmitter.emit(
          TEAM_EVENTS.UPDATED,
          new TeamUpdatedEvent(id, changedFields, actorId)
        )
      if (leaderId !== existingTeam.leaderId)
        this.eventEmitter.emit(
          TEAM_EVENTS.LEADER_CHANGED,
          new TeamLeaderChangedEvent(
            id,
            leaderId,
            existingTeam.leaderId,
            actorId
          )
        )
      for (const [userId, sessionIds] of roster.removed)
        this.eventEmitter.emit(
          TEAM_EVENTS.MEMBER_REMOVED,
          new TeamMemberRemovedEvent(id, userId, sessionIds, actorId)
        )
      for (const [userId, sessionIds] of roster.added)
        this.eventEmitter.emit(
          TEAM_EVENTS.MEMBER_ADDED,
          new TeamMemberAddedEvent(id, userId, sessionIds, actorId)
        )

      return this.findOne(id)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2002":
            const target = (error.meta?.target as string[]) ?? []
            if (target.includes("teamId") && target.includes("sessionId"))
              throw new DuplicateTeamSessionError(
                "한 팀에 동일한 세션을 중복하여 추가할 수 없습니다."
              )
            throw new ConflictError(
              "데이터 업데이트 중 중복 오류가 발생했습니다."
            )
          case "P2003":
          case "P2025":
            throw new ReferencedEntityNotFoundError(
              "존재하지 않는 팀장, 세션, 공연, 또는 유저를 팀에 추가할 수 없습니다."
            )
        }
      }
      throw error
    }
  }

  async remove(id: number, actorId: number) {
    const team = await this.findOne(id)
    await this.assertRosterOpen(
      team.performanceId,
      "모집이 끝난 팀은 삭제할 수 없습니다."
    )

    try {
      await this.prisma.team.delete({ where: { id } })
    } catch (error) {
      throw error
    }

    const memberIds = [
      ...new Set([
        team.leaderId,
        ...team.teamSessions.flatMap((s) => s.members.map((m) => m.userId))
      ])
    ]
    this.eventEmitter.emit(
      TEAM_EVENTS.DELETED,
      new TeamDeletedEvent(
        id,
        team.name,
        team.performanceId,
        memberIds,
        actorId
      )
    )

    return team
  }

  async apply(id: number, userId: number, applyTeamDto: TeamApplicationDto) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        teamSessions: {
          include: {
            members: true
          }
        }
      }
    })

    if (!team) throw new NotFoundError(`ID가 ${id}인 팀을 찾을 수 없습니다.`)
    await this.assertRosterOpen(
      team.performanceId,
      "팀 모집 기간이 아니라 지원·탈퇴할 수 없습니다."
    )

    const teamSessionMap = new Map(
      team.teamSessions.map((s) => [s.sessionId, s])
    )

    for (const applySession of applyTeamDto) {
      const { sessionId, index } = applySession
      // 1. 해당 세션이 팀에 존재하는지 확인
      const targetSession = teamSessionMap.get(sessionId)

      if (!targetSession) {
        throw new SessionNotFoundError(
          `이 팀에는 ${await this.sessionLabel(sessionId)} 세션 자리가 없습니다.`
        )
      }

      // 2. 지원하고자 하는 index가 해당 세션의 capacity를 넘지 않는지 확인
      if (index < 1 || index > targetSession.capacity)
        throw new ValidationError(
          `${await this.sessionLabel(sessionId)} 세션 정원은 ${targetSession.capacity}명이라 ${index}번 자리에 지원할 수 없습니다.`
        )

      // 3. 이미 해당 세션에 지원한 이력이 있는지 확인
      const isAlreadyApplied = targetSession.members.some(
        (m) => m.userId === userId
      )
      if (isAlreadyApplied) {
        throw new DuplicateApplicationError(
          `이미 이 팀의 ${await this.sessionLabel(sessionId)} 세션에 지원했습니다.`
        )
      }

      // 4. 지원하고자 하는 index에 이미 다른 멤버가 지원했는지 확인
      if (targetSession.members.some((m) => m.index === index)) {
        throw new PositionOccupiedError(
          `${await this.sessionLabel(sessionId)} ${index}번 자리는 이미 다른 부원이 지원했습니다.`
        )
      }
    }

    const newMembers = applyTeamDto.map((s) => {
      const targetSession = teamSessionMap.get(s.sessionId)
      return {
        index: s.index,
        teamSessionId: targetSession!.id,
        userId
      }
    })

    try {
      await this.prisma.teamMember.createMany({
        data: newMembers
      })
      this.eventEmitter.emit(
        TEAM_EVENTS.MEMBER_ADDED,
        new TeamMemberAddedEvent(
          id,
          userId,
          applyTeamDto.map((s) => s.sessionId),
          userId
        )
      )

      return this.findOne(id)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          // Race Condition으로 인한 중복 지원 문제 해결 (Conflict Error 발생)
          const target = (error.meta?.target as string[]) ?? []

          if (target.includes("teamSessionId") && target.includes("userId"))
            throw new DuplicateApplicationError(
              "이미 해당 세션에 지원한 이력이 있습니다."
            )

          if (target.includes("teamSessionId") && target.includes("index"))
            throw new PositionOccupiedError(
              "해당 포지션은 방금 다른 사용자가 먼저 지원했습니다."
            )
        }
      }
      throw error
    }
  }

  async unapply(
    id: number,
    userId: number,
    unapplyTeamDto: TeamApplicationDto
  ) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        teamSessions: {
          include: {
            members: true
          }
        }
      }
    })

    if (!team) throw new NotFoundError(`ID가 ${id}인 팀을 찾을 수 없습니다.`)
    await this.assertRosterOpen(
      team.performanceId,
      "팀 모집 기간이 아니라 지원·탈퇴할 수 없습니다."
    )

    const memberIdsToDelete: number[] = []

    const teamSessionMap = new Map(
      team.teamSessions.map((s) => [s.sessionId, s])
    )

    for (const unapplySession of unapplyTeamDto) {
      const { sessionId, index } = unapplySession

      const targetSession = teamSessionMap.get(sessionId)
      if (!targetSession)
        throw new SessionNotFoundError(
          `이 팀에는 ${await this.sessionLabel(sessionId)} 세션 자리가 없습니다.`
        )

      const targetMember = targetSession.members.find((m) => m.index === index)
      if (!targetMember)
        throw new NoApplicationFoundError(
          `${await this.sessionLabel(sessionId)} ${index}번 자리에는 지원한 사람이 없습니다.`
        )

      if (targetMember.userId !== userId)
        throw new ForbiddenError(
          `${await this.sessionLabel(sessionId)} ${index}번 자리는 본인이 지원한 자리가 아니라 취소할 수 없습니다.`
        )

      memberIdsToDelete.push(targetMember.id)
    }

    try {
      await this.prisma.teamMember.deleteMany({
        where: {
          id: {
            in: memberIdsToDelete
          }
        }
      })
      this.eventEmitter.emit(
        TEAM_EVENTS.MEMBER_REMOVED,
        new TeamMemberRemovedEvent(
          id,
          userId,
          unapplyTeamDto.map((s) => s.sessionId),
          userId
        )
      )
      return this.findOne(id)
    } catch (error) {
      throw error
    }
  }

  private async getStage(
    performanceId: number
  ): Promise<PerformanceStage | null> {
    const performance = await this.prisma.performance.findUnique({
      where: { id: performanceId },
      select: {
        recruitStartAt: true,
        recruitEndAt: true,
        feedbackStartAt: true,
        feedbackEndAt: true,
        decidedAt: true,
        endAt: true
      }
    })
    return performance ? getPerformanceStage(performance) : null
  }

  private async assertRosterOpen(performanceId: number, detail: string) {
    const stage = await this.getStage(performanceId)
    if (stage && !isTeamRosterOpen(stage))
      throw new PerformanceRecruitmentClosedError(detail)
  }

  private async assertAdmin(actorId: number) {
    const actor = await this.prisma.user.findUnique({
      where: { id: actorId },
      select: { isAdmin: true }
    })
    if (!actor?.isAdmin)
      throw new ForbiddenError("신입고정팀 설정은 운영진만 바꿀 수 있습니다.")
  }
}
