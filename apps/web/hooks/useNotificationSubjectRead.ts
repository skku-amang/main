"use client"

import { useEffect } from "react"

import { useMarkNotificationsReadBySubject } from "@/hooks/api/useNotification"
import { useAuth } from "@/lib/providers/auth-provider"

type Subject = { teamId: number } | { performanceId: number }

/**
 * 알림이 가리키는 대상(팀/공연) 페이지의 클라이언트 컴포넌트 맨 위에서 호출한다.
 * 로그인한 사용자의 그 대상 알림을 읽음 처리한다 — 푸시를 눌러 들어온 경우도 이 경로로 처리.
 * early return보다 먼저 두면 로딩·에러 분기와 무관하게 한 번 실행된다.
 */
export function useNotificationSubjectRead(subject: Subject) {
  const { user } = useAuth()
  const markRead = useMarkNotificationsReadBySubject()
  const key = "teamId" in subject ? "teamId" : "performanceId"
  const id = "teamId" in subject ? subject.teamId : subject.performanceId

  useEffect(() => {
    if (!user || !Number.isFinite(id)) return
    markRead.mutate([{ [key]: id }])
    // markRead는 매 렌더 새 객체 — 사용자·대상이 바뀔 때만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, key, id])
}
