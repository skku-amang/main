import { redirect } from "next/navigation"

import TeamFormBackground from "@/app/(general)/(dark)/performances/[id]/teams/_components/TeamForm/Background"
import { auth } from "@/auth"
import OleoPageHeader from "@/components/PageHeaders/OleoPageHeader"
import ROUTES from "@/constants/routes"

import TeamForm from "../_components/TeamForm"

interface TeamCreatePageProps {
  params: Promise<{
    id: number
  }>
}

const TeamCreatePage = async (props: TeamCreatePageProps) => {
  const params = await props.params
  const performanceId = params.id

  const session = await auth()
  if (!session) redirect(ROUTES.LOGIN)

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <TeamFormBackground />

      <OleoPageHeader
        title="Create Your Team"
        goBackHref={ROUTES.PERFORMANCE.TEAM.LIST(performanceId)}
      />

      <TeamForm className="w-full bg-white px-7 py-10 md:p-20" />
    </div>
  )
}

export default TeamCreatePage
