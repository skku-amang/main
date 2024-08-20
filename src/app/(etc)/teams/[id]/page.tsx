import { TEAMS } from "@/lib/dummy"
import { Team } from "../../../../../types/Team"

const TeamDetail = ({ params }: { params: { id: string } }) => {
  const teamData: Team = TEAMS[+params.id]
  if (!teamData) {
    alert("Not Found")
  }

  return (
    <>
      {teamData.name}
    </>
  )
}

export default TeamDetail