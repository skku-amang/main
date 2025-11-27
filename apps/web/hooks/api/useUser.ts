import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery"
import ApiClient from "@repo/api-client"

export const useCreateUser = createMutationHook(ApiClient.prototype.createUser)

export const useUsers = createQueryHook(ApiClient.prototype.getUsers, () => [
  "users"
])

export const useUser = createQueryHook(
  ApiClient.prototype.getUserById,
  (userId: number | undefined) => ["user", userId]
)

export const useUpdateUser = createMutationHook(ApiClient.prototype.updateUser)

export const useDeleteUser = createMutationHook(ApiClient.prototype.deleteUser)
