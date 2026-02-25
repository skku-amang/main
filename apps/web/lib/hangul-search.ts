import { disassemble, getChoseong } from "es-hangul"

const CHOSEONGS = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"

function isChoseong(char: string): boolean {
  return CHOSEONGS.includes(char)
}

/**
 * 초성 검색: "ㅂㄷ" → "밴드" 매칭
 */
function chosungIncludes(target: string, search: string): boolean {
  if (!search.split("").every(isChoseong)) return false
  const targetChosung = getChoseong(target)
  return targetChosung.includes(search)
}

/**
 * 한글 부분 일치: 자모 분해 후 비교하여 조합 중인 글자도 매칭
 * - "노래" → "노래방" 매칭
 * - "밴" → "밴드" 매칭
 */
function hangulIncludes(target: string, search: string): boolean {
  return disassemble(target).includes(disassemble(search))
}

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
