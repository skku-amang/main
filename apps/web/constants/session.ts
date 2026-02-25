/**
 * SessionName 값 (Prisma SessionName enum과 동일)
 * 클라이언트 번들에서 @repo/database 를 직접 import하면
 * PrismaClient 네이티브 바이너리가 포함되므로 여기서 별도 정의
 */
export const SESSION_NAMES = {
  VOCAL: "VOCAL",
  GUITAR: "GUITAR",
  BASS: "BASS",
  SYNTH: "SYNTH",
  DRUM: "DRUM",
  STRINGS: "STRINGS",
  WINDS: "WINDS"
} as const

export type SessionNameValue =
  (typeof SESSION_NAMES)[keyof typeof SESSION_NAMES]

/**
 * SessionName → 한글 표시명 매핑
 */
export const SESSION_DISPLAY_NAME: Record<SessionNameValue, string> = {
  [SESSION_NAMES.VOCAL]: "보컬",
  [SESSION_NAMES.GUITAR]: "기타",
  [SESSION_NAMES.BASS]: "베이스",
  [SESSION_NAMES.SYNTH]: "신디",
  [SESSION_NAMES.DRUM]: "드럼",
  [SESSION_NAMES.STRINGS]: "현악기",
  [SESSION_NAMES.WINDS]: "관악기"
}

/**
 * SessionName을 한글 표시명으로 변환
 */
export function getSessionDisplayName(sessionName: string): string {
  return SESSION_DISPLAY_NAME[sessionName as SessionNameValue] ?? sessionName
}
