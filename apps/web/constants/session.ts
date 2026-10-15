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
 * SessionName → 한글 표시명 매핑. 정의는 @repo/shared-types (알림 문구와 공유)
 */
export { SESSION_DISPLAY_NAME } from "@repo/shared-types"

/**
 * SessionName을 한글 표시명으로 변환
 */
export function getSessionDisplayName(sessionName: string): string {
  return SESSION_DISPLAY_NAME[sessionName as SessionNameValue] ?? sessionName
}
