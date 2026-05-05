/**
 * Performance 도메인의 React Query 훅.
 *
 * Spec-derived: @repo/api-client/spec/v1/performance.yaml → Hey API → queryOptions/mutations.
 * 이 파일은 generated queryOptions에 기존 호출부 시그니처(`mutate([id, payload])` 등)를 보존하는
 * 얇은 어댑터 — Phase 2 마이그레이션 정리 시 호출부를 generated 직접 사용으로 옮기면 본 파일도 삭제.
 */
import {
  createPerformanceMutation,
  deletePerformanceMutation,
  getPerformanceByIdOptions,
  getPerformancesOptions,
  updatePerformanceMutation
} from "@repo/api-client/generated/react-query"
import { useMutation, useQuery } from "@tanstack/react-query"

// Date | string | null | undefined → ISO string | null | undefined
// Spec(generated)은 date-time을 string으로 표현하므로 호출부의 Date 인자를 ISO로 normalize.
type DateLike = Date | string | null | undefined
const toIso = (v: DateLike): string | null | undefined => {
  if (v === null) return null
  if (v === undefined) return undefined
  if (v instanceof Date) return v.toISOString()
  return v
}

const normalizeBody = <T extends Record<string, unknown>>(body: T): T => {
  const out: Record<string, unknown> = { ...body }
  if ("startAt" in out) out.startAt = toIso(out.startAt as DateLike)
  if ("endAt" in out) out.endAt = toIso(out.endAt as DateLike)
  return out as T
}

export const usePerformances = () => useQuery(getPerformancesOptions())

export const usePerformance = (id: number) =>
  useQuery(getPerformanceByIdOptions({ path: { id } }))

// ─── Mutations: 기존 호출부 시그니처 호환 (`[body]`, `[id, body]`, `[id]`) ──
type CreateArgs = [body: Record<string, unknown>]
type UpdateArgs = [id: number, body: Record<string, unknown>]
type DeleteArgs = [id: number]

export const useCreatePerformance = () => {
  const m = useMutation(createPerformanceMutation())
  return {
    ...m,
    mutate: ([body]: CreateArgs) =>
      m.mutate({ body: normalizeBody(body) as never }),
    mutateAsync: ([body]: CreateArgs) =>
      m.mutateAsync({ body: normalizeBody(body) as never })
  }
}

export const useUpdatePerformance = () => {
  const m = useMutation(updatePerformanceMutation())
  return {
    ...m,
    mutate: ([id, body]: UpdateArgs) =>
      m.mutate({ path: { id }, body: normalizeBody(body) as never }),
    mutateAsync: ([id, body]: UpdateArgs) =>
      m.mutateAsync({ path: { id }, body: normalizeBody(body) as never })
  }
}

export const useDeletePerformance = () => {
  const m = useMutation(deletePerformanceMutation())
  return {
    ...m,
    mutate: ([id]: DeleteArgs) => m.mutate({ path: { id } }),
    mutateAsync: ([id]: DeleteArgs) => m.mutateAsync({ path: { id } })
  }
}
