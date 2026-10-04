import { redirect } from "next/navigation"

import ROUTES from "@/constants/routes"
import { apiClient } from "@/lib/apiClient"

export const dynamic = "force-dynamic"

export default async function LatestPerformanceTeamsPage() {
  // 종료 일시가 가까운 순으로 정렬되어 있어 첫 번째가 지금 모집 중인 공연
  const [recruiting] = await apiClient.getPerformances({
    status: "recruiting"
  })
  if (!recruiting) redirect(ROUTES.PERFORMANCE.LIST)

  redirect(ROUTES.PERFORMANCE.TEAM.LIST(recruiting.id))
}
