import Link from "next/link"

import { Button } from "@/components/ui/button"
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
      <p className="my-8 text-center font-bold">Performances</p>
      <div className="flex gap-x-4">
        {data.map((p) => (
          <Link key={p.id} href={ROUTES.PERFORMANCE.DETAIL(p.id).url}>
            <Button className="rounded-xl py-0 shadow" variant="secondary">
              {p.name}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default RelatedPerformanceList
