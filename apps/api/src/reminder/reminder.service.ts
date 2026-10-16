import { Injectable } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { NotificationType } from "@repo/database"
import { TeamRecruitmentDeadlinePayloadSchema } from "@repo/shared-types"
import { PrismaService } from "../prisma/prisma.service"
import { kstDayStart } from "../common/kst"
import {
  REMINDER_EVENTS,
  TeamRecruitmentDeadlineEvent
} from "./reminder.events"

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

    const sentToday = await this.prisma.notification.findMany({
      where: {
        type: NotificationType.TEAM_RECRUITMENT_DEADLINE,
        createdAt: { gte: kstDayStart(now) }
      },
      select: { payload: true }
    })
    const notifiedTeamIds = new Set(
      sentToday.flatMap((n) => {
        const parsed = TeamRecruitmentDeadlinePayloadSchema.safeParse(n.payload)
        return parsed.success ? [parsed.data.teamId] : []
      })
    )

    const due = incomplete.filter((t) => !notifiedTeamIds.has(t.id))
    for (const team of due)
      this.eventEmitter.emit(
        REMINDER_EVENTS.TEAM_RECRUITMENT_DEADLINE,
        new TeamRecruitmentDeadlineEvent(team.id)
      )
    return due.length
  }
}
