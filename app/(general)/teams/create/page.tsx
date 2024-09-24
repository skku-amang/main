import { redirect } from "next/navigation"

import TeamCreateForm from "@/app/(general)/teams/create/_components/TeamCreateForm"
import { auth } from "@/auth"
import ROUTES from "@/constants/routes"

const TeamCreatePage = async () => {
  const session = await auth()
  if (!session) redirect(ROUTES.LOGIN.url)

  return (
    <div>
      <TeamCreateForm />
    </div>
  )
}

export default TeamCreatePage
