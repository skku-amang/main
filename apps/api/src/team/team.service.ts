import { Injectable } from "@nestjs/common"
import { CreateTeamDto } from "./dto/create-team.dto"
import { UpdateTeamDto } from "./dto/update-team.dto"
import { TeamApplicationDto } from "./dto/team-application.dto"
import { PrismaService } from "../prisma/prisma.service"
import { Prisma } from "@repo/database"
import { basicUser, publicUser } from "../prisma/selectors/user.selector"
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnprocessableEntityError,
  ValidationError,
  DuplicateApplicationError,
  PositionOccupiedError,
  SessionNotFoundError,
  NoApplicationFoundError
} from "@repo/api-client"

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createTeamDto: CreateTeamDto) {
    const { leaderId, memberSessions, ...scalarData } = createTeamDto

    if (memberSessions.length > 0) {
      for (const session of memberSessions) {
        const { capacity, sessionId, members } = session

        if (members.length === 0) continue

        const indexSet = new Set<number>()
        const userSet = new Set<number>()

        for (const member of members) {
          if (member.index < 1 || member.index > capacity) {
            throw new ValidationError(
              `세션(ID: ${sessionId})의 멤버 인덱스는 1과 정원(${capacity}) 사이의 값이어야 합니다.`
            )
          }
          if (indexSet.has(member.index)) {
            throw new ValidationError(
              `세션(ID: ${sessionId}) 내에 중복된 인덱스(${member.index})가 존재합니다.`
            )
          }
          if (userSet.has(member.userId)) {
            throw new ValidationError(
              `세션(ID: ${sessionId}) 내에 중복된 사용자(ID: ${member.userId})가 존재합니다.`
            )
          }
          indexSet.add(member.index)
          userSet.add(member.userId)
        }
      }
    }

    const createPayload: Prisma.TeamCreateInput = {
      ...scalarData,
      leader: { connect: { id: leaderId } }
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

      return this.findOne(team.id)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2002":
            const target = (error.meta?.target as string[]) ?? []
            if (target.includes("teamId") && target.includes("sessionId"))
              throw new UnprocessableEntityError(
                "한 팀에 동일한 세션을 중복하여 추가할 수 없습니다."
              )
            throw new ConflictError(
              "이미 존재하는 데이터와 충돌이 발생했습니다."
            )
          case "P2003":
            throw new UnprocessableEntityError(
              "존재하지 않는 리더, 세션, 또는 유저를 팀에 추가할 수 없습니다."
            )
        }
      }
      throw error
    }
  }

  async findAll() {
    const teams = await this.prisma.team.findMany({
      include: {
        leader: {
          select: basicUser
        },
        teamSessions: {
          include: {
            session: true,
            members: {
              include: {
                user: {
                  select: basicUser
                }
              },
              orderBy: {
                index: "asc"
              }
            }
          }
        }
      }
    })

    return teams
  }

  async findOne(id: number) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        leader: {
          select: publicUser
        },
        teamSessions: {
          include: {
            session: true,
            members: {
              include: {
                user: {
                  select: publicUser
                }
              }
            }
          }
        }
      }
    })
    if (!team) throw new NotFoundError(`ID가 ${id}인 팀을 찾을 수 없습니다.`)

    return team
  }

  async update(id: number, updateTeamDto: UpdateTeamDto) {
    const {
      leaderId,
      memberSessions,
      description,
      posterImage,
      songYoutubeVideoUrl,
      ...scalarData
    } = updateTeamDto

    const existingTeam = await this.prisma.team.findUnique({
      where: { id },
      include: { teamSessions: true }
    })
    if (!existingTeam)
      throw new NotFoundError(`ID가 ${id}인 팀을 찾을 수 없습니다.`)

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
            throw new ValidationError(
              `세션(ID: ${sessionId})의 멤버 인덱스(${member.index})는 1과 정원(${capacity}) 사이의 값이어야 합니다.`
            )
          if (indexSet.has(member.index))
            throw new ValidationError(
              `세션(ID: ${sessionId}) 내에 중복된 인덱스(${member.index})가 존재합니다.`
            )
          if (userSet.has(member.userId))
            throw new ValidationError(
              `세션(ID: ${sessionId}) 내에 중복된 사용자(ID: ${member.userId})가 존재합니다.`
            )
          userSet.add(member.userId)
          indexSet.add(member.index)
        }
      }

      if (existingSession) {
        prismaOperaions.push(
          this.prisma.teamSession.update({
            where: { id: existingSession.id },
            data: {
              capacity: newSession.capacity,
              members: {
                deleteMany: {},
                create: newSession.members.map((m) => ({
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
          posterImage: posterImage ?? null,
          songYoutubeVideoUrl: songYoutubeVideoUrl ?? null,
          leader: { connect: { id: leaderId } }
        }
      })
    )

    try {
      if (prismaOperaions.length > 0)
        await this.prisma.$transaction(prismaOperaions)
      return this.findOne(id)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2002":
            const target = (error.meta?.target as string[]) ?? []
            if (target.includes("teamId") && target.includes("sessionId"))
              throw new UnprocessableEntityError(
                "한 팀에 동일한 세션을 중복하여 추가할 수 없습니다."
              )
            throw new ConflictError(
              "데이터 업데이트 중 중복 오류가 발생했습니다."
            )
          case "P2003":
            throw new UnprocessableEntityError(
              "존재하지 않는 리더, 세션, 또는 유저를 팀에 추가할 수 없습니다."
            )
          case "P2025":
            throw new NotFoundError(
              "업데이트하려는 데이터를 찾을 수 없습니다. 다른 요청에 의해 삭제되었을 수 있습니다."
            )
        }
      }
      throw error
    }
  }

  async remove(id: number) {
    const team = await this.findOne(id)
    try {
      await this.prisma.team.delete({ where: { id } })
    } catch (error) {
      // TODO: Handle specific Prisma errors
      throw error
    }
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

    const teamSessionMap = new Map(
      team.teamSessions.map((s) => [s.sessionId, s])
    )

    for (const applySession of applyTeamDto) {
      const { sessionId, index } = applySession
      // 1. 해당 세션이 팀에 존재하는지 확인
      const targetSession = teamSessionMap.get(sessionId)

      if (!targetSession) {
        throw new NotFoundError(
          `세션(ID: ${sessionId})이 팀에 존재하지 않습니다.`
        )
      }

      // 2. 지원하고자 하는 index가 해당 세션의 capacity를 넘지 않는지 확인
      if (index < 1 || index > targetSession.capacity)
        throw new ValidationError(
          `지원하려는 인덱스(${index})가 세션(ID: ${sessionId})의 정원(${targetSession.capacity}명)을 초과합니다.`
        )

      // 3. 이미 해당 세션에 지원한 이력이 있는지 확인
      const isAlreadyApplied = targetSession.members.some(
        (m) => m.userId === userId
      )
      if (isAlreadyApplied) {
        throw new DuplicateApplicationError(
          `이미 세션(ID: ${sessionId})에 지원한 이력이 있습니다.`
        )
      }

      // 4. 지원하고자 하는 index에 이미 다른 멤버가 지원했는지 확인
      if (targetSession.members.some((m) => m.index === index)) {
        throw new PositionOccupiedError(
          `세션(ID: ${sessionId})의 인덱스(${index})는 이미 다른 멤버가 지원했습니다.`
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

    const memberIdsToDelete: number[] = []

    const teamSessionMap = new Map(
      team.teamSessions.map((s) => [s.sessionId, s])
    )

    for (const unapplySession of unapplyTeamDto) {
      const { sessionId, index } = unapplySession

      const targetSession = teamSessionMap.get(sessionId)
      if (!targetSession)
        throw new SessionNotFoundError(
          `세션(ID: ${sessionId})이 팀에 존재하지 않습니다.`
        )

      const targetMember = targetSession.members.find((m) => m.index === index)
      if (!targetMember)
        throw new NoApplicationFoundError(
          `세션(ID: ${sessionId})의 ${index}번 자리에는 지원한 멤버가 없습니다.`
        )

      if (targetMember.userId !== userId)
        throw new ForbiddenError(
          `세션(ID: ${sessionId})의 ${index}번 자리를 취소할 권한이 없습니다.`
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
      return this.findOne(id)
    } catch (error) {
      throw error
    }
  }
}
