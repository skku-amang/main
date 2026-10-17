import { useEffect, useState } from "react"

export type TeamListView = "card" | "table"

const STORAGE_KEY = "amang:team-list-view"

/**
 * 팀 목록 보기 형식. 고른 적 없으면 null — 기본값(표)을 쓴다.
 * 서버 렌더와 어긋나지 않도록 저장값은 마운트 후에 읽는다.
 */
export const useTeamListView = () => {
  const [view, setView] = useState<TeamListView | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === "card" || saved === "table") setView(saved)
    } catch {
      // 저장소를 못 쓰면 기본값
    }
  }, [])

  const chooseView = (next: TeamListView) => {
    setView(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // 저장 못 해도 이번 방문 동안은 유지
    }
  }

  return [view, chooseView] as const
}
