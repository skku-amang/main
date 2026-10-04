import { redirect } from "next/navigation"

import ROUTES from "@/constants/routes"
import { apiClient } from "@/lib/apiClient"

export const dynamic = "force-dynamic"

export default async function LatestPerformanceTeamsPage() {
  const performances = await apiClient.getPerformances()
  if (performances.length === 0) redirect(ROUTES.PERFORMANCE.LIST)

  const latestId = Math.max(...performances.map((p) => p.id))
  redirect(ROUTES.PERFORMANCE.TEAM.LIST(latestId))
}
