import Link from "next/link"
import { CiCirclePlus } from "react-icons/ci"

import PerformanceCard from "@/app/(general)/(light)/performances/_components/PerformanceCard"
import Loading from "@/app/_(errors)/Loading"
import { auth } from "@/auth"
import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import Search from "@/components/Search"
import { Button } from "@/components/ui/button"
import API_ENDPOINTS from "@/constants/apiEndpoints"
import ROUTES from "@/constants/routes"
import fetchData from "@/lib/fetch"
import { ListResponse } from "@/lib/fetch/responseBodyInterfaces"
import { Performance } from "@repo/shared-types"

const PerformanceList = async () => {
  const session = await auth()
  if (!session) {
    return <Loading />
  }
  const res = await fetchData(API_ENDPOINTS.PERFORMANCE.LIST, {
    cache: "no-cache",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${session.access}`
    }
  })
  const performances = (await res.json()) as ListResponse<Performance>

  return (
    <div>
      <DefaultPageHeader
        title="공연 목록"
        routes={[
          { display: <DefaultHomeIcon />, href: ROUTES.HOME },
          { display: "아카이브" },
          { display: "공연 목록", href: ROUTES.PERFORMANCE.LIST }
        ]}
      />

      {/* 도구 모음 */}
      <div className="mb-3 flex justify-between gap-x-2">
        <Search />
        <Button asChild className="flex items-center">
          <Link href={ROUTES.PERFORMANCE.CREATE}>
            <CiCirclePlus size={20} />
            &nbsp;추가
          </Link>
        </Button>
      </div>

      {/* 공연 카드 목록 */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {performances.map((p) => (
          <PerformanceCard
            key={p.id}
            id={p.id}
            name={p.name}
            representativeSrc={p.representativeImage}
            location={p.location}
            startDatetime={
              p.startDatetime ? new Date(p.startDatetime) : undefined
            }
          />
        ))}
      </div>
    </div>
  )
}
export default PerformanceList
