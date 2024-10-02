import { redirect } from "next/navigation"

import TeamForm from "@/app/(general)/teams/_components/TeamForm"
import { auth } from "@/auth"
import ROUTES from "@/constants/routes"

const TeamEditPage = async () => {
  const session = await auth()
  if (!session) redirect(ROUTES.LOGIN.url)

  return (
    <div>
      <TeamForm initialData={{}} />
    </div>
  )
}

export default TeamEditPage
