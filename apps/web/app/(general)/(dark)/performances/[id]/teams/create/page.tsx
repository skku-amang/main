"use client"

import TeamFormBackground from "@/app/(general)/(dark)/performances/[id]/teams/_components/TeamForm/Background"
import OleoPageHeader from "@/components/PageHeaders/OleoPageHeader"
import ROUTES from "@/constants/routes"

import { useCreateTeam } from "@/hooks/api/useTeam"
import { useSession } from "next-auth/react"
import { redirect, useParams } from "next/navigation"
import TeamForm from "../_components/TeamForm"

const TeamCreatePage = () => {
  const params = useParams()
  const performanceId = Number(params.id)
  const useCreateTeamResult = useCreateTeam()

  const session = useSession()

  if (session.status === "loading") {
    return <div>Loading...</div>
  }

  if (session.status === "unauthenticated") {
    redirect(ROUTES.LOGIN)
  }
  const userId = session.data?.user?.id

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <TeamFormBackground />

      <OleoPageHeader
        title="Create Your Team"
        goBackHref={ROUTES.PERFORMANCE.TEAM.LIST(performanceId)}
      />

      <TeamForm
        userId={Number(userId)}
        useCreateOrUpdateTeam={useCreateTeamResult}
        className="w-full bg-white px-7 py-10 md:p-20"
      />
    </div>
  )
}

export default TeamCreatePage
