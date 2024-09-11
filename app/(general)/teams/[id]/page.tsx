import React from "react"

import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import fetchData from "@/lib/fetch"
import { CreateRetrieveUpdateResponse } from "@/lib/fetch/responseBodyInterfaces"
import { Team } from "@/types/Team"

import { createTeam } from "../../../../lib/dummy/Team"
import MemberSessionTable from "./_components/MemberSessionTable"
import PromotionPostList from "./_components/PromotionPostList"
import SongInfo from "./_components/SongInfo"
import TeamInfo from "./_components/TeamInfo"

interface Props {
  params: {
    id: number
  }
}

const TeamDetail = async ({ params }: Props) => {
  const { id } = params
  const _team = createTeam(id)

  const res = await fetchData(API_ENDPOINTS.TEAM.RETRIEVE(id) as ApiEndpoint, {
    cache: "no-cache"
  })
  const team = (await res.json()) as CreateRetrieveUpdateResponse<Team>

  return (
    <div className="my-3 grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="col-span-1 flex flex-col gap-y-3">
        {/* 기본 정보 */}
        <TeamInfo team={team} />

        {/* 곡 정보 */}
        <SongInfo
          songName={team.songName}
          songArtist={team.songArtist}
          songYoutubeUrl={team.songYoutubeVideoId}
        />
      </div>

      <div className="col-span-1 flex flex-col gap-y-3">
        {/* 멤버 정보 */}
        <MemberSessionTable
          team={team}
          memberSessions={team.memberSessions ?? []}
          leader={team.memberSessions && team.memberSessions[0]?.members[0]}
        />

        {/* 홍보글 */}
        <PromotionPostList />
      </div>
    </div>
  )
}

export default TeamDetail
