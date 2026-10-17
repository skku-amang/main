/**
 * 2배로 저장된 기수를 실제 기수로 변환합니다 (23.5기 같은 반기수 표현용).
 * @param order - 데이터베이스에 저장된 기수 (예: 46, 47, ..., 74)
 * @returns 실제 기수 (예: "23", "23.5", ..., "37")
 */
export function formatGenerationOrder(order: number): string {
  return (order / 2).toString()
}
