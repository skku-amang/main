"use client"

import { useParams } from "next/navigation"

import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import ROUTES from "@/constants/routes"
import { usePerformances } from "@/hooks/api/usePerformance"
import { useTeams } from "@/hooks/api/useTeam"

import { columns } from "./_components/TeamListTable/columns"
import { TeamListDataTable } from "./_components/TeamListTable/data-table"

const TeamList = () => {
  const params = useParams()
  const performanceId = Number(params.id)

  const { data: teams, status: teamsStatus } = useTeams(performanceId)
  const { data: relatedPerformances, status: relatedPerformancesStatus } =
    usePerformances()

  if (teamsStatus === "pending" || relatedPerformancesStatus === "pending") {
    return <div>로딩중...</div>
  }

  if (
    teamsStatus === "error" ||
    relatedPerformancesStatus === "error" ||
    teams === undefined ||
    relatedPerformances === undefined
  ) {
    return <div>오류가 발생했습니다.</div>
  }

  return (
    <div>
      {/* 팀 배너 */}
      <DefaultPageHeader
        title="공연팀 목록"
        routes={[
          {
            display: <DefaultHomeIcon />,
            href: ROUTES.HOME
          },
          {
            display: "모집"
          },
          {
            display: "공연팀 목록",
            href: ROUTES.PERFORMANCE.TEAM.LIST(performanceId)
          }
        ]}
      />

      {/* 팀 목록 */}
      <TeamListDataTable
        className="mb-4 mt-6 md:my-0"
        columns={columns}
        data={teams}
        relatedPerformances={relatedPerformances}
        performanceId={performanceId}
      />
    </div>
  )
}

export default TeamList
