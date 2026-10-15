"use client"

import { CirclePlus } from "lucide-react"
import Link from "next/link"

import PerformanceCard from "@/app/(general)/(light)/performances/_components/PerformanceCard"
import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import Search from "@/components/Search"
import { Button } from "@/components/ui/button"
import ROUTES from "@/constants/routes"
import { usePerformances } from "@/hooks/api/usePerformance"

const PerformanceListClient = () => {
  const { data: performances } = usePerformances()

  return (
    <div>
      <DefaultPageHeader
        title="공연 목록"
        routes={[
          { display: <DefaultHomeIcon />, href: ROUTES.HOME },
          { display: "공연 목록", href: ROUTES.PERFORMANCE.LIST }
        ]}
      />

      {/* 도구 모음 */}
      <div className="mb-3 flex justify-between gap-x-2">
        <Search className="h-9 min-w-0 flex-1 md:h-10 md:w-80 md:flex-none" />
        <Button
          asChild
          className="h-9 rounded-lg px-4 text-sm font-medium md:h-10 md:w-[136px] md:rounded-full md:text-[20px] md:font-semibold"
        >
          <Link href={ROUTES.ADMIN.PERFORMANCES}>
            <CirclePlus className="me-1 size-4 md:me-[9px] md:size-6" />
            Create
          </Link>
        </Button>
      </div>

      {/* 공연 카드 목록 */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {performances === undefined ? (
          <div>Loading...</div>
        ) : (
          performances.map((p) => (
            <PerformanceCard
              key={p.id}
              id={p.id}
              name={p.name}
              posterSrc={p.image}
              location={p.location}
              startAt={p.startAt}
            />
          ))
        )}
      </div>
    </div>
  )
}
export default PerformanceListClient
