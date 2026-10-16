import { Injectable } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { EquipCategory, NotificationType } from "@repo/database"
import {
  EquipmentReturnDuePayloadSchema,
  RoomReservationSoonPayloadSchema,
  TeamRecruitmentDeadlinePayloadSchema
} from "@repo/shared-types"
import { PrismaService } from "../prisma/prisma.service"
import { kstDayStart } from "../common/kst"
import {
  EquipmentReturnDueEvent,
  REMINDER_EVENTS,
  RoomReservationSoonEvent,
  TeamRecruitmentDeadlineEvent
} from "./reminder.events"

const HOUR = 60 * 60 * 1000

/** 시간이 되면 보내는 알림. 어떤 대상이 due인지만 판정하고, 수신자·문구는 리스너가 맡는다 */
@Injectable()
export class ReminderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * 내일(한국 날짜) 모집이 마감되는 공연에서 아직 빈자리가 있는 팀마다 이벤트 1건.
   * 같은 팀에는 하루 한 번 — 오늘 만들어진 같은 유형 알림이 있으면 건너뛴다.
   * @returns 이벤트를 낸 팀 수
   */
  async remindRecruitmentDeadline(now: Date) {
    // 지원 가능 조건이 endAt > now 라서 endAt 정각은 이미 닫힌 뒤 → 내일 00:00 마감은 "오늘 마감"
    const teams = await this.prisma.team.findMany({
      where: {
        Performance: {
          endAt: { gt: kstDayStart(now, 1), lte: kstDayStart(now, 2) }
        }
      },
      select: {
        id: true,
        teamSessions: {
          select: { capacity: true, members: { select: { userId: true } } }
        }
      }
    })
    const incomplete = teams.filter((t) =>
      t.teamSessions.some((s) => s.members.length < s.capacity)
    )
    if (incomplete.length === 0) return 0

    const notified = await this.notifiedIds(
      NotificationType.TEAM_RECRUITMENT_DEADLINE,
      kstDayStart(now),
      (payload) => {
        const parsed = TeamRecruitmentDeadlinePayloadSchema.safeParse(payload)
        return parsed.success ? parsed.data.teamId : undefined
      }
    )
    const due = incomplete.filter((t) => !notified.has(t.id))
    for (const team of due)
      this.eventEmitter.emit(
        REMINDER_EVENTS.TEAM_RECRUITMENT_DEADLINE,
        new TeamRecruitmentDeadlineEvent(team.id)
      )
    return due.length
  }

  /**
   * 동방 예약 시작 1시간 전. 10분 주기라 (now, now+1h] 창을 보고 예약당 한 번만 —
   * tick을 하나 건너뛰어도 다음 tick이 잡는다.
   * @returns 이벤트를 낸 예약 수
   */
  async remindRoomReservations(now: Date) {
    const rentals = await this.prisma.equipmentRental.findMany({
      where: {
        equipment: { category: EquipCategory.ROOM },
        startAt: { gt: now, lte: new Date(now.getTime() + HOUR) }
      },
      select: { id: true }
    })
    if (rentals.length === 0) return 0

    const notified = await this.notifiedIds(
      NotificationType.ROOM_RESERVATION_SOON,
      new Date(now.getTime() - 2 * HOUR),
      (payload) => {
        const parsed = RoomReservationSoonPayloadSchema.safeParse(payload)
        return parsed.success ? parsed.data.rentalId : undefined
      }
    )
    const due = rentals.filter((r) => !notified.has(r.id))
    for (const rental of due)
      this.eventEmitter.emit(
        REMINDER_EVENTS.ROOM_RESERVATION_SOON,
        new RoomReservationSoonEvent(rental.id)
      )
    return due.length
  }

  /**
   * 장비(동방 제외) 반납 기한이 오늘(한국 날짜)인 대여마다 하루 한 번.
   * @returns 이벤트를 낸 대여 수
   */
  async remindEquipmentReturns(now: Date) {
    const rentals = await this.prisma.equipmentRental.findMany({
      where: {
        equipment: { category: { not: EquipCategory.ROOM } },
        endAt: { gt: kstDayStart(now), lte: kstDayStart(now, 1) }
      },
      select: { id: true }
    })
    if (rentals.length === 0) return 0

    const notified = await this.notifiedIds(
      NotificationType.EQUIPMENT_RETURN_DUE,
      kstDayStart(now),
      (payload) => {
        const parsed = EquipmentReturnDuePayloadSchema.safeParse(payload)
        return parsed.success ? parsed.data.rentalId : undefined
      }
    )
    const due = rentals.filter((r) => !notified.has(r.id))
    for (const rental of due)
      this.eventEmitter.emit(
        REMINDER_EVENTS.EQUIPMENT_RETURN_DUE,
        new EquipmentReturnDueEvent(rental.id)
      )
    return due.length
  }

  /** `since` 이후 만들어진 같은 유형 알림에서 대상 id를 모은다 — 리마인더 멱등의 근거 */
  private async notifiedIds(
    type: NotificationType,
    since: Date,
    idOf: (payload: unknown) => number | undefined
  ) {
    const rows = await this.prisma.notification.findMany({
      where: { type, createdAt: { gte: since } },
      select: { payload: true }
    })
    return new Set(
      rows.flatMap((n) => {
        const id = idOf(n.payload)
        return id === undefined ? [] : [id]
      })
    )
  }
}
