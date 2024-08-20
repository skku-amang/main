import { TEAMS } from "@/lib/dummy"
import { DataTable } from "@/components/TeamListTable/data-table"
import { columns, TeamColumn } from "@/components/TeamListTable/columns"


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
  return (
    <div className="container">
      <DataTable columns={columns} data={rows} />
    </div>
  )
}

export default TeamList