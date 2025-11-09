"use client"

import { useParams } from "next/navigation"

import ErrorPage from "@/app/_(errors)/Error"
import TeamFormBackground from "@/app/(general)/(dark)/performances/[id]/teams/_components/TeamForm/Background"
import OleoPageHeader from "@/components/PageHeaders/OleoPageHeader"
import ROUTES from "@/constants/routes"
import { useTeam } from "@/hooks/api/useTeam"

import TeamForm from "../../_components/TeamForm"

const TeamEditPage = () => {
  const params = useParams()
  const performanceId = Number(params.id)
  const teamId = Number(params.teamId)

  const { data: team, isError } = useTeam(teamId)

  if (isError) {
    return <ErrorPage />
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <TeamFormBackground />

      <OleoPageHeader
        title="Create Your Team"
        goBackHref={ROUTES.PERFORMANCE.TEAM.DETAIL(performanceId, teamId)}
      />

      <TeamForm
        initialData={team}
        className="w-full bg-white px-7 py-10 md:p-20"
      />
    </div>
  )
}

export default TeamEditPage
