import Link from "next/link"

import API_ENDPOINTS from "@/constants/apiEndpoints"
import fetchData from "@/lib/fetch"
import { ListResponse } from "@/lib/fetch/responseBodyInterfaces"
import { Team } from "@/types/Team"

import { Badge } from "../../../components/ui/badge"
import ROUTES from "../../../constants/routes"
import { generateDummys } from "../../../lib/dummy"
import { createPerformance } from "../../../lib/dummy/Performance"
import { createTeam } from "../../../lib/dummy/Team"
import { columns } from "./_components/TeamListTable/columns"
import { TeamListDataTable } from "./_components/TeamListTable/data-table"

const _TEAMS = generateDummys(45, createTeam)
// const _teams: TeamColumn[] = _TEAMS.map((team) => ({
//   id: team.id,
//   songName: team.songName,
//   songArtist: team.songArtist,
//   leaderName: team.leader?.name,
//   memberSessions: team.memberSessions,
//   coverUrl: team.songYoutubeVideoId,
//   isFreshmanFixed: team.isFreshmanFixed
// }))

// TODO: 검색 기준을 곡명이 아니라 모든 것으로 확장
// TODO: Pagination에서 1,2,3,4,5 등 추가
const TeamList = async () => {
  const activePerformances = generateDummys(3, createPerformance)
  const res = await fetchData(API_ENDPOINTS.TEAM.LIST, {
    cache: "no-cache"
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
        <h2 className="mt-24 text-4xl font-extrabold text-gray-600">
          공연팀 목록
        </h2>
        <p className="my-8 font-bold">Performances</p>
        <div className="flex gap-x-4">
          {activePerformances.map((p) => (
            <Link
              key={p.id}
              href={ROUTES.PERFORMANCE.DETAIL.url(p.id.toString())}
            >
              <Badge className="text-md rounded-xl bg-slate-200 px-6 py-1 font-normal text-black">
                {p.name}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* 팀 목록 테이블 */}
      <TeamListDataTable columns={columns} data={teams} />
    </div>
  )
}

export default TeamList
