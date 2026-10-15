import { Test, TestingModule } from "@nestjs/testing"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { PerformanceService } from "./performance.service"
import {
  PERFORMANCE_EVENTS,
  PerformanceCreatedEvent
} from "./performance.events"
import { PrismaService } from "../prisma/prisma.service"
import { ObjectStorageService } from "../object-storage/object-storage.service"

describe("PerformanceService", () => {
  let service: PerformanceService
  let emit: jest.Mock

  beforeEach(async () => {
    emit = jest.fn()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerformanceService,
        {
          provide: PrismaService,
          useValue: {
            performance: {
              create: jest.fn(async () => ({ id: 3 })),
              findUnique: jest.fn(async () => ({ id: 3, teams: [] })),
              findAll: jest.fn(),
              findTeamsByPerformanceId: jest.fn(),
              findOne: jest.fn(),
              update: jest.fn(),
              delete: jest.fn()
            }
          }
        },
        {
          provide: ObjectStorageService,
          useValue: {
            deleteObjectSafely: jest.fn()
          }
        },
        { provide: EventEmitter2, useValue: { emit } }
      ]
    }).compile()

    service = module.get<PerformanceService>(PerformanceService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  it("공연이 만들어지면 performance.created를 발행한다", async () => {
    await service.create({ name: "봄 공연" }, 42)

    expect(emit).toHaveBeenCalledWith(
      PERFORMANCE_EVENTS.CREATED,
      new PerformanceCreatedEvent(3, 42)
    )
  })
})
