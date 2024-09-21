import { redirect } from "next/navigation"

import TeamCreateForm from "@/app/(general)/teams/create/_components/TeamCreateForm"
import { auth } from "@/auth"
import API_ENDPOINTS from "@/constants/apiEndpoints"
import ROUTES from "@/constants/routes"
import fetchData from "@/lib/fetch"
import { ListResponse } from "@/lib/fetch/responseBodyInterfaces"
import { Performance } from "@/types/Performance"

const TeamCreatePage = async () => {
  const session = await auth()
  if (!session) redirect(ROUTES.LOGIN.url)

  const res = await fetchData(API_ENDPOINTS.PERFORMANCE.LIST, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${session.access}`
    }
  })
  const performanceOptions = (await res.json()) as ListResponse<Performance>

  return (
    <div>
      <TeamCreateForm performanceOptions={performanceOptions} />
    </div>
  )
}

export default TeamCreatePage
