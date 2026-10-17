import { NotificationType, SessionName } from "@repo/database/enums"
import { formatGenerationOrder } from "../generation/generation.format"
import type { NotificationItem } from "./notification.schema"

/** SessionName → 한글 표시명. 알림 문구·세션 UI가 함께 쓴다 */
export const SESSION_DISPLAY_NAME: Record<SessionName, string> = {
  VOCAL: "보컬",
  GUITAR: "기타",
  BASS: "베이스",
  SYNTH: "신디",
  DRUM: "드럼",
  STRINGS: "현악기",
  WINDS: "관악기"
}

/** 알림 유형 → 설정 화면 표시명. 순서가 곧 화면 순서 (#708) */
export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
  TEAM_MEMBER_CHANGE: "팀원 합류·탈퇴",
  TEAM_ATTRIBUTE_CHANGE: "팀 정보 변경",
  TEAM_LEADER_CHANGED: "팀장 교체",
  TEAM_FILLED: "팀 정원 마감",
  TEAM_DELETED: "팀 삭제",
  TEAM_CREATED: "새 팀",
  PERFORMANCE_CREATED: "새 공연",
  PERFORMANCE_UPDATED: "공연 정보 변경",
  BOOKMARKED_TEAM_SPOT_OPENED: "별표한 팀에 빈자리",
  TEAM_RECRUITMENT_DEADLINE: "모집 마감 하루 전",
  ROOM_RESERVATION_SOON: "동방 예약 1시간 전",
  EQUIPMENT_RETURN_DUE: "장비 반납 당일",
  USER_SIGNED_UP: "가입 신청",
  USER_APPROVED: "가입 승인"
}

const TEAM_FIELD_LABEL: Record<string, string> = {
  name: "팀 이름",
  description: "설명",
  image: "포스터",
  songName: "곡명",
  songArtist: "아티스트",
  isFreshmenFixed: "신입생 고정",
  isSelfMade: "자작곡",
  songYoutubeVideoUrl: "유튜브 링크",
  leaderId: "팀장",
  performanceId: "공연",
  sessions: "세션 구성"
}

const PERFORMANCE_FIELD_LABEL: Record<string, string> = {
  name: "공연 이름",
  startAt: "시작 일시",
  endAt: "종료 일시",
  location: "장소"
}

export type FormattedNotification = {
  title: string
  body: string
  href: string
  /** 같은 tag의 푸시는 기기 알림창에서 최신 것으로 덮어쓴다 */
  tag: string
}

/** Pick을 union 각 멤버에 분배해 type↔payload 상관관계를 유지한다 */
type DistributivePick<T, K extends keyof T> = T extends unknown
  ? Pick<T, K>
  : never

export type NotificationContent = DistributivePick<
  NotificationItem,
  "type" | "payload"
>

const teamHref = (performanceId: number, teamId: number) =>
  `/performances/${performanceId}/teams/${teamId}`

const teamTag = (teamId: number) => `team-${teamId}`

/** 서버(UTC)·브라우저 어디서 렌더해도 한국 시각 "15:00". payload를 거친 날짜는 문자열일 수 있어 new Date로 받는다 */
const kstTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Seoul",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23"
})
const formatKstTime = (at: Date | string) => kstTime.format(new Date(at))
const kstDate = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Seoul",
  month: "numeric",
  day: "numeric"
})
const formatKstDate = (at: Date | string) => kstDate.format(new Date(at))

/**
 * 저장된 type + payload를 사람이 읽을 문구와 이동 경로로 바꾼다.
 * 인앱 알림함과 푸시 본문이 같은 함수를 쓴다 (문구는 저장하지 않는다는 설계 §5).
 */
export function formatNotification(
  item: NotificationContent
): FormattedNotification {
  switch (item.type) {
    case "TEAM_MEMBER_CHANGE": {
      const p = item.payload
      const sessions = p.sessionNames
        .map((s) => SESSION_DISPLAY_NAME[s])
        .join(", ")
      const body =
        p.changeType === "ADDED"
          ? `${p.memberName}님이 ${sessions ? `${sessions} 멤버로` : "팀에"} 합류했습니다`
          : `${p.memberName}님이 ${sessions ? `${sessions}에서` : "팀에서"} 빠졌습니다`
      return {
        title: p.teamName,
        body,
        href: teamHref(p.performanceId, p.teamId),
        tag: teamTag(p.teamId)
      }
    }
    case "TEAM_ATTRIBUTE_CHANGE": {
      const p = item.payload
      const fields = p.changedFields
        .map((f) => TEAM_FIELD_LABEL[f] ?? f)
        .join(", ")
      return {
        title: p.teamName,
        body: `팀 정보가 바뀌었습니다: ${fields}`,
        href: teamHref(p.performanceId, p.teamId),
        tag: teamTag(p.teamId)
      }
    }
    case "TEAM_CREATED": {
      const p = item.payload
      return {
        title: p.performanceName,
        body: `새 팀이 생겼습니다: ${p.teamName}`,
        href: teamHref(p.performanceId, p.teamId),
        tag: teamTag(p.teamId)
      }
    }
    case "PERFORMANCE_CREATED": {
      const p = item.payload
      return {
        title: "새 공연",
        body: `${p.performanceName} 팀 모집이 시작됐습니다`,
        href: `/performances/${p.performanceId}/teams`,
        tag: `performance-${p.performanceId}`
      }
    }
    case "PERFORMANCE_UPDATED": {
      const p = item.payload
      const fields = p.changedFields
        .map((f) => PERFORMANCE_FIELD_LABEL[f] ?? f)
        .join(", ")
      return {
        title: p.performanceName,
        body: `공연 정보가 바뀌었습니다: ${fields}`,
        href: `/performances/${p.performanceId}`,
        tag: `performance-${p.performanceId}`
      }
    }
    case "TEAM_DELETED": {
      const p = item.payload
      return {
        title: p.performanceName,
        body: `${p.teamName} 팀이 삭제됐습니다`,
        href: `/performances/${p.performanceId}/teams`,
        tag: `performance-${p.performanceId}`
      }
    }
    case "TEAM_LEADER_CHANGED": {
      const p = item.payload
      return {
        title: p.teamName,
        body: p.assigned
          ? "팀장이 됐어요"
          : `팀장이 ${p.leaderName}님으로 바뀌었어요`,
        href: teamHref(p.performanceId, p.teamId),
        tag: teamTag(p.teamId)
      }
    }
    case "TEAM_FILLED": {
      const p = item.payload
      return {
        title: p.teamName,
        body: "멤버가 모두 모였어요",
        href: teamHref(p.performanceId, p.teamId),
        tag: teamTag(p.teamId)
      }
    }
    case "USER_SIGNED_UP": {
      const p = item.payload
      return {
        title: "새 가입 신청",
        body: `${formatGenerationOrder(p.generationOrder)}기 ${p.userName}님이 가입을 신청했어요`,
        href: "/admin/pending-users",
        tag: "user-signup"
      }
    }
    case "USER_APPROVED": {
      const p = item.payload
      return {
        title: "가입 승인",
        body: `${p.userName}님, AMANG 가입이 승인됐어요. 환영해요!`,
        href: "/",
        tag: "user-approved"
      }
    }
    case "BOOKMARKED_TEAM_SPOT_OPENED": {
      const p = item.payload
      const sessions = p.sessionNames
        .map((s) => SESSION_DISPLAY_NAME[s])
        .join(", ")
      return {
        title: "별표한 팀에 자리가 났어요",
        body: `${p.teamName} 팀 ${sessions ? `${sessions} ` : ""}자리가 났어요`,
        href: teamHref(p.performanceId, p.teamId),
        tag: teamTag(p.teamId)
      }
    }
    case "TEAM_RECRUITMENT_DEADLINE": {
      const p = item.payload
      const slots = p.openSlots
        .map((s) => `${SESSION_DISPLAY_NAME[s.sessionName]} ${s.count}자리`)
        .join(", ")
      return {
        title: p.teamName,
        body: slots
          ? `내일 모집 마감 — ${slots} 비어 있어요`
          : "내일 모집 마감이에요",
        href: teamHref(p.performanceId, p.teamId),
        tag: teamTag(p.teamId)
      }
    }
    case "ROOM_RESERVATION_SOON": {
      const p = item.payload
      return {
        title: "동방 예약 1시간 전",
        body: `${formatKstTime(p.startAt)} 동방 예약 — ${p.title}`,
        href: "/reservations/clubroom",
        tag: `rental-${p.rentalId}`
      }
    }
    case "EQUIPMENT_RETURN_DUE": {
      const p = item.payload
      return {
        title: "장비 반납",
        body: `${formatKstDate(p.endAt)} ${formatKstTime(p.endAt)}까지 ${p.equipmentName} 반납`,
        href: `/reservations/equipment/${p.equipmentId}`,
        tag: `rental-${p.rentalId}`
      }
    }
  }
}
