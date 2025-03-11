import { redirect } from "next/navigation"

import { auth } from "@/auth"
import PageHeader from "@/components/PageHeader"
import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import ROUTES from "@/constants/routes"
import fetchData from "@/lib/fetch"
import { ListResponse } from "@/lib/fetch/responseBodyInterfaces"
import { Team } from "@/types/Team"

import { columns } from "./_components/TeamListTable/columns"
import { TeamListDataTable } from "./_components/TeamListTable/data-table"

interface TeamListProps {
  params: Promise<{
    id: number
  }>
}

const TeamList = async (props: TeamListProps) => {
  const params = await props.params;
  const { id } = params
  const session = await auth()
  if (!session) redirect(ROUTES.LOGIN)

  const res = await fetchData(
    API_ENDPOINTS.PERFORMANCE.RETRIEVE_TEAMS(id) as ApiEndpoint,
    {
      cache: "no-cache",
      headers: {
        Authorization: `Bearer ${session.access}`
      }
    }
  )

  const data = (await res.json()) as ListResponse<Team>
  const teams = data.map((team) => ({
    performanceId: team.performance.id,
    id: team.id,
    songName: team.songName,
    songArtist: team.songArtist,
    leader: team.leader,
    memberSessions: team.memberSessions,
    songYoutubeVideoId: team.songYoutubeVideoId,
    isFreshmenFixed: team.isFreshmenFixed,
    isSelfMade: team.isSelfMade
  }))

  const relatedPerformances = await (
    await fetchData(API_ENDPOINTS.PERFORMANCE.LIST, {
      cache: "no-cache",
      headers: {
        Authorization: `Bearer ${session.access}`
      }
    })
  ).json()

  return (
    <div className="container">
      {/* 팀 배너 */}
      <div className="flex flex-col items-center justify-center">
        <PageHeader>공연팀 목록</PageHeader>
      </div>

      {/* 팀 목록 */}
      <TeamListDataTable
        columns={columns}
        data={teams}
        relatedPerformances={relatedPerformances}
        performanceId={id}
      />
    </div>
  )
}

export default TeamList
