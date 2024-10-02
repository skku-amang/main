import { redirect } from "next/navigation"

import TeamForm from "@/app/(general)/teams/_components/TeamForm"
import { auth } from "@/auth"
import ROUTES from "@/constants/routes"

const TeamCreatePage = async () => {
  const session = await auth()
  if (!session) redirect(ROUTES.LOGIN.url)

  return (
    <div>
      <TeamForm />
    </div>
  )
}

export default TeamCreatePage
