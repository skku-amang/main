import { mapUser, mapUsers } from "@/hooks/api/mapper"
import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery"
import ApiClient from "@repo/api-client"

export const useCreateUser = createMutationHook(
  ApiClient.prototype.createUser,
  mapUser
)

export const useUsers = createQueryHook(
  ApiClient.prototype.getUsers,
  () => ["users"],
  mapUsers
)

export const useUser = createQueryHook(
  ApiClient.prototype.getUserById,
  (userId: number) => ["user", userId],
  mapUser
)

export const useUpdateUser = createMutationHook(
  ApiClient.prototype.updateUser,
  mapUser
)

export const useDeleteUser = createMutationHook(ApiClient.prototype.deleteUser)
