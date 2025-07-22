import { DEFAULT_REACT_QUERY_STALE_TIME } from "@/constants/api"
import { useApiClient } from "@/lib/providers/api-client-provider"
import { Team } from "@repo/shared-types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useCreateTeam() {
  const apiClient = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (performanceId: number, teamData: CreateTeamDTO) =>
      apiClient.createTeam(performanceId, teamData),
    onSuccess: (newTeam: Team) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      queryClient.setQueryData(["team", newTeam.id], newTeam)
      if (newTeam.performance.id) {
        queryClient.invalidateQueries({
          queryKey: ["teams", "performance", newTeam.performance.id]
        })
      }
    }
  })
}

export function useTeams(performanceId: number, enabled: boolean = true) {
  const apiClient = useApiClient()

  return useQuery({
    queryKey: ["teams", "performance", performanceId],
    queryFn: () => apiClient.getTeamsByPerformance(performanceId),
    enabled: enabled && !!performanceId,
    staleTime: DEFAULT_REACT_QUERY_STALE_TIME
  })
}

export function useTeam(teamId: number, enabled: boolean = true) {
  const apiClient = useApiClient()

  return useQuery({
    queryKey: ["team", teamId],
    queryFn: () => apiClient.getTeamById(teamId),
    enabled: enabled && !!teamId,
    staleTime: DEFAULT_REACT_QUERY_STALE_TIME
  })
}

export function useUpdateTeam(teamId: number) {
  const apiClient = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updateData: UpdateTeamDTO) =>
      apiClient.updateTeam(teamId, updateData),
    onSuccess: (updatedTeam: Team) => {
      queryClient.setQueryData(["team", teamId], updatedTeam)
      queryClient.invalidateQueries({ queryKey: ["teams"] })
    }
  })
}

export function useDeleteTeam() {
  const apiClient = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (teamId: number) => apiClient.deleteTeam(teamId),
    onSuccess: (_, deletedTeamId) => {
      queryClient.removeQueries({ queryKey: ["team", deletedTeamId] })
      queryClient.invalidateQueries({ queryKey: ["teams"] })
    }
  })
}

export function useTeamApplication(teamId: number) {
  const apiClient = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (applicationData: TeamApplicationDTO) =>
      apiClient.applyToTeam(teamId, applicationData),
    onSuccess: (updatedTeam: Team) => {
      queryClient.setQueryData(["team", teamId], updatedTeam)
      queryClient.invalidateQueries({ queryKey: ["teams"] })
    }
  })
}
