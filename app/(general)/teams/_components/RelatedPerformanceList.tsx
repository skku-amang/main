import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import API_ENDPOINTS from "@/constants/apiEndpoints"
import ROUTES from "@/constants/routes"
import fetchData from "@/lib/fetch"
import { ListResponse } from "@/lib/fetch/responseBodyInterfaces"
import { cn } from "@/lib/utils"
import { Performance } from "@/types/Performance"

interface RelatedPerformanceListProps {
  currentPerformanceId: number
}

const RelatedPerformanceList = async ({
  currentPerformanceId
}: RelatedPerformanceListProps) => {
  const session = await auth()
  if (!session) redirect(ROUTES.LOGIN.url)

  const res = await fetchData(API_ENDPOINTS.PERFORMANCE.LIST, {
    cache: "no-cache",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${session.access}`
    }
  })
  const data = (await res.json()) as ListResponse<Performance>

  return (
    <div>
      <p className="my-8 text-center font-bold">Performances</p>
      <div className="flex gap-x-4">
        {data.map((p) => (
          <Link key={p.id} href={ROUTES.PERFORMANCE.DETAIL(p.id).url}>
            <Button
              className={cn(
                "rounded-xl bg-zinc-100 py-0 text-black shadow hover:bg-zinc-200",
                currentPerformanceId === p.id &&
                  "border-2 border-primary font-extrabold text-primary"
              )}
            >
              {currentPerformanceId === p.id && "Current: "}
              {p.name}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default RelatedPerformanceList
