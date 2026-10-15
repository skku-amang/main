import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery"
import ApiClient from "@repo/api-client"

export const useUsers = createQueryHook(ApiClient.prototype.getUsers, () => [
  "users"
])

// 자기소개·이메일 등 관리자만 보는 정보 포함. 키가 "users"로 시작해 목록 무효화에 함께 걸림
export const useUsersForAdmin = createQueryHook(
  ApiClient.prototype.getUsersForAdmin,
  () => ["users", "admin"]
)

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
