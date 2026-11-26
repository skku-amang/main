const SEEN_KEY = "amang:updates-seen-at"

/** 마지막으로 확인한 업데이트 날짜(YYYY-MM-DD). 처음 온 기기는 null */
export const readUpdatesSeenAt = (): string | null => {
  try {
    return localStorage.getItem(SEEN_KEY)
  } catch {
    return null
  }
}

export const markUpdatesSeen = (date: string) => {
  try {
    if ((readUpdatesSeenAt() ?? "") < date) localStorage.setItem(SEEN_KEY, date)
  } catch {
    // 저장소를 못 쓰는 브라우저면 "New" 표시만 남는다
  }
}
