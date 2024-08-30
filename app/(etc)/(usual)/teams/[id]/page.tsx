import React from 'react'

import MemberSessionTable from '../../../../../components/TeamDetail/MemberSessionTable'
import PromotionPostList from '../../../../../components/TeamDetail/PromotionPostList'
import SongInfo from '../../../../../components/TeamDetail/SongInfo'
import TeamInfo from '../../../../../components/TeamDetail/TeamInfo'
import { createTeam } from '../../../../../lib/dummy/Team'

interface Props {
  params: {
    id: number
  }
}

const TeamDetail = async ({ params }: Props) => {
  const { id } = params
  const team = createTeam(id)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3">
      <div className='col-span-1 flex flex-col gap-y-3'>
        {/* 기본 정보 */}
        <div>
          <TeamInfo team={team} />
        </div>

        {/* 곡 정보 */}
        <div>
          <SongInfo song={team.song} />
        </div>
      </div>

      <div className='col-span-1 flex flex-col gap-y-3'>
        {/* 멤버 정보 */}
        <div>
          <MemberSessionTable team={team} memberSessions={team.memberSessions} leader={team.memberSessions[0].members[0]} />
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
