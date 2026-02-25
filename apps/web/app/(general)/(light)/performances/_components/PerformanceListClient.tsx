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
          { display: "아카이브" },
          { display: "공연 목록", href: ROUTES.PERFORMANCE.LIST }
        ]}
      />

      {/* 도구 모음 */}
      <div className="mb-3 flex justify-between gap-x-2">
        <Search />
        <Button
          asChild
          className="h-10 w-[136px] rounded-full text-[20px] font-semibold"
        >
          <Link href={ROUTES.ADMIN.PERFORMANCES}>
            <CirclePlus size={24} className="me-[9px]" />
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
              posterSrc={p.posterImage}
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
