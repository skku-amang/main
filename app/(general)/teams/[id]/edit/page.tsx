import { StatusCodes } from "http-status-codes"
import { redirect } from "next/navigation"

import ErrorPage from "@/app/_(errors)/Error"
import NotFoundPage from "@/app/_(errors)/NotFound"
import TeamForm from "@/app/(general)/teams/_components/TeamForm"
import { auth } from "@/auth"
import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import ROUTES from "@/constants/routes"
import fetchData from "@/lib/fetch"

interface TeamEditPageProps {
  params: {
    id: number
  }
}

const TeamEditPage = async ({ params }: TeamEditPageProps) => {
  const { id } = params

  const session = await auth()
  if (!session) redirect(ROUTES.LOGIN.url)

  const res = await fetchData(API_ENDPOINTS.TEAM.RETRIEVE(id) as ApiEndpoint, {
    cache: "no-cache",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${session.access}`
    }
  })

  if (!res.ok) {
    switch (res.status) {
      case StatusCodes.NOT_FOUND:
        return <NotFoundPage />
      default:
        return <ErrorPage />
    }
  }

  const data = (await res.json()) as any

  return (
    <div>
      <TeamForm initialData={data} />
    </div>
  )
}

export default TeamEditPage
