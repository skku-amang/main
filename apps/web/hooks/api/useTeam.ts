import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery"
import { getTeamsByPerformanceOptions } from "@repo/api-client/generated/react-query"
import ApiClient from "@repo/api-client"
import { useQuery } from "@tanstack/react-query"

export const useAllTeams = createQueryHook(ApiClient.prototype.getTeams, () => [
  "teams",
  "all"
])

export const useCreateTeam = createMutationHook(ApiClient.prototype.createTeam)

// Performance endpoint(/performances/:id/teams)는 spec-derived로 마이그레이션 완료.
export const useTeams = (performanceId: number) =>
  useQuery(getTeamsByPerformanceOptions({ path: { id: performanceId } }))

export const useTeam = createQueryHook(
  ApiClient.prototype.getTeamById,
  (teamId: number) => ["team", teamId]
)

export const useUpdateTeam = createMutationHook(ApiClient.prototype.updateTeam)

export const useDeleteTeam = createMutationHook(ApiClient.prototype.deleteTeam)

export const useApplyToTeam = createMutationHook(
  ApiClient.prototype.applyToTeam
)

export const useUnapplyFromTeam = createMutationHook(
  ApiClient.prototype.unapplyFromTeam
)
