import { SessionName } from "@repo/database/enums"
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

export type FormattedNotification = {
  title: string
  body: string
  href: string
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
        href: teamHref(p.performanceId, p.teamId)
      }
    }
    case "TEAM_ATTRIBUTE_CHANGE": {
      const p = item.payload
      const fields = p.changedFields
        .map((f) => TEAM_FIELD_LABEL[f] ?? f)
        .join(", ")
      return {
        title: p.teamName,
        body: `${fields}이 바뀌었습니다`,
        href: teamHref(p.performanceId, p.teamId)
      }
    }
    case "TEAM_CREATED": {
      const p = item.payload
      return {
        title: p.performanceName,
        body: `새 팀이 생겼습니다: ${p.teamName}`,
        href: teamHref(p.performanceId, p.teamId)
      }
    }
    case "PERFORMANCE_CREATED": {
      const p = item.payload
      return {
        title: "새 공연",
        body: `${p.performanceName} 팀 모집이 시작됐습니다`,
        href: `/performances/${p.performanceId}/teams`
      }
    }
  }
}
