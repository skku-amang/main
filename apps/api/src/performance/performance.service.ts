import { Injectable } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { CreatePerformanceDto } from "./dto/create-performance.dto"
import { UpdatePerformanceDto } from "./dto/update-performance.dto"
import { PrismaService } from "../prisma/prisma.service"
import { NotFoundError, InvalidPerformanceDateError } from "@repo/api-client"
import { Prisma } from "@repo/database"
import {
  GetPerformancesQuery,
  performanceFindOneInclude,
  performanceTeamsInclude,
  recruitingPerformanceWhere
} from "@repo/shared-types"
import { ObjectStorageService } from "../object-storage/object-storage.service"
import {
  PERFORMANCE_EVENTS,
  PerformanceCreatedEvent,
  PerformanceUpdatedEvent,
  changedPerformanceFields
} from "./performance.events"

@Injectable()
export class PerformanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly objectStorageService: ObjectStorageService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async create(createPerformanceDto: CreatePerformanceDto, actorId: number) {
    const performance = await this.prisma.performance.create({
      data: createPerformanceDto
    })
    this.eventEmitter.emit(
      PERFORMANCE_EVENTS.CREATED,
      new PerformanceCreatedEvent(performance.id, actorId)
    )

    return this.findOne(performance.id)
  }

  async findAll(status?: GetPerformancesQuery["status"]) {
    if (status === "recruiting") {
      return this.prisma.performance.findMany({
        where: recruitingPerformanceWhere(),
        orderBy: [{ endAt: { sort: "asc", nulls: "last" } }, { id: "asc" }]
      })
    }

    const performances = await this.prisma.performance.findMany({
      orderBy: { id: "asc" }
    })
    return performances
  }

  async findTeamsByPerformanceId(id: number) {
    const performance = await this.prisma.performance.findUnique({
      where: { id },
      include: performanceTeamsInclude
    })

    if (!performance)
      throw new NotFoundError(`ID가 ${id}인 공연을 찾을 수 없습니다.`)
    return performance.teams
  }

  async findOne(id: number) {
    const performance = await this.prisma.performance.findUnique({
      where: { id },
      include: performanceFindOneInclude
    })

    if (!performance)
      throw new NotFoundError(`ID가 ${id}인 공연을 찾을 수 없습니다.`)

    return performance
  }

  async update(
    id: number,
    updatePerformanceDto: UpdatePerformanceDto,
    actorId: number
  ) {
    const performance = await this.prisma.performance.findUnique({
      where: { id }
    })

    if (!performance)
      throw new NotFoundError(`ID가 ${id}인 공연을 찾을 수 없습니다.`)

    const oldImageUrl = performance.image
    const changedFields = changedPerformanceFields(
      performance,
      updatePerformanceDto
    )

    const startAt = updatePerformanceDto.startAt ?? performance.startAt
    const endAt = updatePerformanceDto.endAt ?? performance.endAt

    if (startAt && endAt && startAt > endAt) {
      throw new InvalidPerformanceDateError(
        "공연의 시작 일시는 종료 일시보다 이전이어야 합니다."
      )
    }

    try {
      await this.prisma.performance.update({
        where: { id },
        data: updatePerformanceDto
      })
      if (changedFields.length > 0)
        this.eventEmitter.emit(
          PERFORMANCE_EVENTS.UPDATED,
          new PerformanceUpdatedEvent(id, changedFields, actorId)
        )

      if (
        updatePerformanceDto.image !== undefined &&
        oldImageUrl &&
        oldImageUrl !== updatePerformanceDto.image
      )
        this.objectStorageService.deleteObjectSafely(oldImageUrl)

      return this.findOne(id)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          // Race Condition 방지
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
    const performance = await this.findOne(id)
    try {
      await this.prisma.performance.delete({ where: { id } })
    } catch (error) {
      throw error
    }
    return performance
  }
}
