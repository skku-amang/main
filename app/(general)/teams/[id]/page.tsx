import React from 'react'

import MemberSessionTable from './_components/MemberSessionTable'
import PromotionPostList from './_components/PromotionPostList'
import SongInfo from './_components/SongInfo'
import TeamInfo from './_components/TeamInfo'
import { createTeam } from '../../../../lib/dummy/Team'

interface Props {
  params: {
    id: number
  }
}

const TeamDetail = async ({ params }: Props) => {
  const { id } = params
  const team = createTeam(id)

  return (
    <div className="my-3 grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="col-span-1 flex flex-col gap-y-3">
        {/* 기본 정보 */}
        <div>
          <TeamInfo team={team} />
        </div>

        {/* 곡 정보 */}
        <div>
          <SongInfo song={team.song} />
        </div>
      </div>

      <div className="col-span-1 flex flex-col gap-y-3">
        {/* 멤버 정보 */}
        <div>
          <MemberSessionTable
            team={team}
            memberSessions={team.memberSessions}
            leader={team.memberSessions[0].members[0]}
          />
        </div>

        {/* 홍보글 */}
        <div>
          <PromotionPostList />
        </div>
      </div>
    </div>
  )
}

export default TeamDetail
