import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery"
import ApiClient from "@repo/api-client"

export const useUsers = createQueryHook(ApiClient.prototype.getUsers, () => [
  "users"
])

export const useUpdateProfile = createMutationHook(
  ApiClient.prototype.updateProfile
)

export const useUpdatePassword = createMutationHook(
  ApiClient.prototype.updatePassword
)

export const useUpdateUser = createMutationHook(ApiClient.prototype.updateUser)

export const useDeleteUser = createMutationHook(ApiClient.prototype.deleteUser)

export const usePendingUsers = createQueryHook(
  ApiClient.prototype.getPendingUsers,
  () => ["pendingUsers"]
)

export const useApproveUser = createMutationHook(
  ApiClient.prototype.approveUser
)
