import { createQueryHook } from "@/hooks/useCustomQuery"
import ApiClient from "@repo/api-client"

export const useUsers = createQueryHook(ApiClient.prototype.getUsers, () => [
  "users"
])
