import ApiClient from "@repo/api-client"

import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery"

export const useCreateTeam = createMutationHook(ApiClient.prototype.createTeam)

export const useTeams = createQueryHook(
  ApiClient.prototype.getTeamsByPerformance,
  (performanceId: number) => ["teams", "performance", performanceId]
)

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
