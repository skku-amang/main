import React from 'react'

import MemberSessionTable from '@/components/TeamDetail/MemberSessionTable'
import SongInfo from '@/components/TeamDetail/SongInfo'
import TeamInfo from '@/components/TeamDetail/TeamInfo'
import { createTeam } from '@/lib/dummy/Team'

interface Props {
  params: {
    id: number
  }
}

const TeamDetail = async ({ params }: Props) => {
  const { id } = params
  const team = createTeam(id)

  return (
    <div className="grid grid-cols-4 gap-3">
      {/* 기본 정보 */}
      <div className="col-span-1 lg:col-span-2">
        <TeamInfo team={team} />
      </div>

      {/* 멤버 정보 */}
      <div className="col-span-1 lg:col-span-2">
        <MemberSessionTable team={team} memberSessions={team.memberSessions} leader={team.memberSessions[0].members[0]} />
      </div>

      {/* 곡 정보 */}
      <div className="col-span-1 lg:col-span-2">
        <SongInfo song={team.song} />
      </div>
    </div>
  )
}

export default TeamDetail
