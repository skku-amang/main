"use client"

import { redirect, useParams } from "next/navigation"

import TeamFormBackground from "@/app/(general)/(dark)/performances/[id]/teams/_components/TeamForm/Background"
import ErrorPage from "@/app/_(errors)/Error"
import OleoPageHeader from "@/components/PageHeaders/OleoPageHeader"
import ROUTES from "@/constants/routes"

import { useTeam, useUpdateTeam } from "@/hooks/api/useTeam"
import { useSession } from "next-auth/react"
import TeamForm from "../../_components/TeamForm"

const TeamEditPage = () => {
  const params = useParams()
  const performanceId = Number(params.id)
  const teamId = Number(params.teamId)
  const useUpdateTeamResult = useUpdateTeam()

  const session = useSession()
  const userId = session.data?.user?.id
  if (!userId) redirect(ROUTES.LOGIN)

  const { data: team, isError, status } = useTeam(teamId)

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

      {status === "pending" ? (
        <div>Loading...</div>
      ) : (
        <TeamForm
          initialData={team}
          userId={Number(userId)}
          useCreateOrUpdateTeam={useUpdateTeamResult}
          className="w-full bg-white px-7 py-10 md:p-20"
        />
      )}
    </div>
  )
}

export default TeamEditPage
