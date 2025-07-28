import { DEFAULT_REACT_QUERY_STALE_TIME } from "@/constants/api"
import { useApiClient } from "@/lib/providers/api-client-provider"
import { User } from "@repo/shared-types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useCreateUser() {
  const apiClient = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: CreateUserDTO) => apiClient.createUser(userData),
    onSuccess: (newUser: User) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.setQueryData(["user", newUser.id], newUser)
    }
  })
}

export function useUsers(enabled: boolean = true) {
  const apiClient = useApiClient()

  return useQuery({
    queryKey: ["users"],
    queryFn: () => apiClient.getUsers(),
    enabled,
    staleTime: DEFAULT_REACT_QUERY_STALE_TIME
  })
}

export function useUser(userId: number, enabled: boolean = true) {
  const apiClient = useApiClient()

  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => apiClient.getUserById(userId),
    enabled: enabled && !!userId,
    staleTime: DEFAULT_REACT_QUERY_STALE_TIME
  })
}

export function useUpdateUser(userId: number) {
  const apiClient = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updateData: UpdateUserDTO) =>
      apiClient.updateUser(userId, updateData),
    onSuccess: (updatedUser: User) => {
      queryClient.setQueryData(["user", userId], updatedUser)
      queryClient.invalidateQueries({ queryKey: ["users"] })
    }
  })
}

export function useDeleteUser() {
  const apiClient = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => apiClient.deleteUser(userId),
    onSuccess: (_, deletedUserId) => {
      queryClient.removeQueries({
        queryKey: ["user", deletedUserId]
      })
      queryClient.invalidateQueries({ queryKey: ["users"] })
    }
  })
}
