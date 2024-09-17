import TeamCreateForm from "@/app/(general)/teams/create/_components/TeamCreateForm"
import API_ENDPOINTS from "@/constants/apiEndpoints"
import fetchData from "@/lib/fetch"
import { ListResponse } from "@/lib/fetch/responseBodyInterfaces"
import { Performance } from "@/types/Performance"

const TeamCreatePage = async () => {
  const res = await fetchData(API_ENDPOINTS.PERFORMANCE.LIST, {
    cache: "no-cache"
  })
  const performanceOptions = (await res.json()) as ListResponse<Performance>

  return (
    <div>
      <TeamCreateForm performanceOptions={performanceOptions} />
    </div>
  )
}

export default TeamCreatePage
