import Link from "next/link"
import React from "react"
import { CiCirclePlus } from "react-icons/ci"

import Loading from "@/app/_(errors)/Loading"
import PerformanceCard from "@/app/(general)/performances/_components/PerformanceCard"
import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import API_ENDPOINTS from "@/constants/apiEndpoints"
import ROUTES from "@/constants/routes"
import fetchData from "@/lib/fetch"
import { ListResponse } from "@/lib/fetch/responseBodyInterfaces"
import { Performance } from "@/types/Performance"

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
    <div className="mb-10">
      {/* 도구 모음 */}
      <div className="mb-3 flex justify-between">
        <div className="flex gap-x-3">
          <Input className="w-72" />
          <Button>검색</Button>
        </div>
        <Button asChild className="flex items-center">
          <Link href={ROUTES.PERFORMANCE.CREATE.url}>
            <CiCirclePlus size={20} />
            &nbsp;추가
          </Link>
        </Button>
      </div>
      
      {/* 공연 카드 목록 */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {performances.map((p) => (
          <div key={p.id} className="flex w-full justify-center">
            <PerformanceCard
              id={p.id}
              name={p.name}
              representativeSrc={p.representativeImage}
              location={p.location}
              startDatetime={
                p.startDatetime ? new Date(p.startDatetime) : undefined
              }
            />
          </div>
        ))}
      </div>
    </div>
  )
}
export default PerformanceList
