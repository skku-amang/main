import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import API_ENDPOINTS from "@/constants/apiEndpoints"
import ROUTES from "@/constants/routes"
import fetchData from "@/lib/fetch"
import { ListResponse } from "@/lib/fetch/responseBodyInterfaces"
import { Performance } from "@/types/Performance"

const RelatedPerformanceList = async () => {
  const res = await fetchData(API_ENDPOINTS.PERFORMANCE.LIST, {
    cache: "no-cache"
  })
  const data = (await res.json()) as ListResponse<Performance>

  return (
    <div>
      <p className="my-8 font-bold">Performances</p>
      <div className="flex gap-x-4">
        {data.map((p) => (
          <Link key={p.id} href={ROUTES.PERFORMANCE.DETAIL(p.id).url}>
            <Badge className="text-md rounded-xl bg-slate-200 px-6 py-1 font-normal text-black">
              {p.name}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default RelatedPerformanceList
