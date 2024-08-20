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

const TeamList = () => {
  return (
    <div className="container">
      <DataTable columns={columns} data={rows} />
    </div>
  )
}

export default TeamList