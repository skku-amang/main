import ApiClient from "@repo/api-client"

import { publicEnv } from "@/lib/publicEnv"

/**
 * 서버 컴포넌트에서 사용
 */
export const apiClient = new ApiClient(publicEnv.API_URL)
