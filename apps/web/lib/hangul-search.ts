import { chosungIncludes, hangulIncludes } from "es-hangul"

/**
 * 한글 친화적 검색: 초성 검색 + 부분 일치를 모두 지원한다.
 * - "ㅂㅌ" → "밴드" 매칭
 * - "노래" → "노래방" 매칭
 * - "ban" → "band" 매칭 (영문 fallback)
 */
export function matchesKorean(target: string, search: string): boolean {
  if (!search) return true
  const t = target.toLowerCase()
  const s = search.toLowerCase()

  // 영문/숫자 fallback
  if (t.includes(s)) return true

  // 한글 부분 일치 (조합 중인 글자도 처리)
  if (hangulIncludes(target, search)) return true

  // 초성 검색
  if (chosungIncludes(target, search)) return true

  return false
}

/**
 * cmdk Command 컴포넌트용 filter 함수.
 * 반환값: 1 = 매칭, 0 = 불일치
 */
export function koreanCommandFilter(value: string, search: string): number {
  return matchesKorean(value, search) ? 1 : 0
}
