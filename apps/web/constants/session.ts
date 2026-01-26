import { SessionName } from "@repo/database"

/**
 * SessionName enum → 한글 표시명 매핑
 */
export const SESSION_DISPLAY_NAME: Record<SessionName, string> = {
  [SessionName.VOCAL]: "보컬",
  [SessionName.GUITAR]: "기타",
  [SessionName.BASS]: "베이스",
  [SessionName.SYNTH]: "신디",
  [SessionName.DRUM]: "드럼",
  [SessionName.STRINGS]: "현악기",
  [SessionName.WINDS]: "관악기"
}

/**
 * SessionName enum을 한글 표시명으로 변환
 */
export function getSessionDisplayName(sessionName: SessionName): string {
  return SESSION_DISPLAY_NAME[sessionName] ?? sessionName
}
