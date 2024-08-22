import { TeamListDataTable } from "@/components/TeamListTable/data-table"
import { columns, TeamColumn } from "@/components/TeamListTable/columns"
import { generateDummys } from "@/lib/dummy"
import { createTeam } from "@/lib/dummy/Team"
import { createPerformance } from "@/lib/dummy/Performance"
import { Badge } from "@/components/ui/badge"

const TEAMS = generateDummys(45, createTeam)
const rows: TeamColumn[] = TEAMS.map((team) => ({
  id: team.id,
  songName: team.song.name,
  songArtist: team.song.artist,
  leaderName: team.leader.name,
  requiredSessions: team.song.unsatisfied_sessions,
  cover_url: team.song.cover_url ?? team.song.original_url,
  is_freshmanFixed: team.is_freshmanFixed
}))

// TODO: column visible 선택 기능 -> 세션별 지원자 확인 할 수 있게
// TODO: 검색 기준을 곡명이 아니라 모든 것으로 확장
// TODO: column 너비 조절
// TODO: 필터 -> Dialog로 처리
// TODO: Footer 맨 밑으로 내리기
// TODO: Pagination에서 1,2,3,4,5 등 추가
// TODO: DataTable Header 색상 변경
// TODO: Primary, Secondary 색상 설정
const TeamList = () => {
  const activePerformances = generateDummys(3, createPerformance)

  return (
    <div className="container">
      {/* 팀 배너 */}
      <div className="flex flex-col justify-center items-center">
        <h2 className="text-4xl font-extrabold text-gray-600 mt-24">공연팀 목록</h2>
        <p className="my-8 font-bold">Performances</p>
        <div className="flex gap-x-4 mb-10">
          {activePerformances.map(p => (
            <Badge
              key={p.id}
              className="py-1 px-6 text-md rounded-xl shadow-sm shadow-slate-500 text-black bg-slate-100 font-normal">
              {p.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* 팀 목록 테이블 */}
      <TeamListDataTable columns={columns} data={rows} />
    </div>
  )
}

export default TeamList