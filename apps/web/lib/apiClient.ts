import ApiClient from "@repo/api-client"

/**
 * 서버 컴포넌트에서 사용
 */
export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
)
