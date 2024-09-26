import RelatedPerformanceList from "@/app/(general)/teams/_components/RelatedPerformanceList"
import { auth } from "@/auth"
import Loading from "@/components/Loading"
import API_ENDPOINTS from "@/constants/apiEndpoints"
import fetchData from "@/lib/fetch"
import { ListResponse } from "@/lib/fetch/responseBodyInterfaces"
import { Team } from "@/types/Team"

import { columns } from "./_components/TeamListTable/columns"
import { TeamListDataTable } from "./_components/TeamListTable/data-table"

// TODO: 검색 기준을 곡명이 아니라 모든 것으로 확장
// TODO: Pagination에서 1,2,3,4,5 등 추가
const TeamList = async () => {
  const session = await auth()
  if (!session) {
    return <Loading />
  }

  const res = await fetchData(API_ENDPOINTS.TEAM.LIST, {
    cache: "no-cache",
    headers: {
      Authorization: `Bearer ${session.access}`
    }
  })

  const data = (await res.json()) as ListResponse<Team>
  const teams = data.map((team) => ({
    id: team.id,
    songName: team.songName,
    songArtist: team.songArtist,
    leaderName: team.leader?.name,
    memberSessions: team.memberSessions,
    songYoutubeVideoId: team.songYoutubeVideoId,
    isFreshmanFixed: team.isFreshmanFixed
  }))

  return (
    <div className="container">
      {/* 팀 배너 */}
      <div className="flex flex-col items-center justify-center">
        <h2 className="mt-28 text-4xl font-extrabold text-zinc-700">
          공연팀 목록
        </h2>

        {/* 연관된 공연 목록 */}
        <RelatedPerformanceList />
      </div>

      {/* 팀 목록 테이블 */}
      <TeamListDataTable columns={columns} data={teams} />
    </div>
  )
}

export default TeamList
