"use client"

import Link from "next/link"
import { CiCirclePlus } from "react-icons/ci"

import PerformanceCard from "@/app/(general)/(light)/performances/_components/PerformanceCard"
import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import Search from "@/components/Search"
import { Button } from "@/components/ui/button"
import ROUTES from "@/constants/routes"
import { usePerformances } from "@/hooks/api/usePerformance"

const PerformanceList = () => {
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
        <Button asChild className="flex items-center">
          <Link href={ROUTES.PERFORMANCE.CREATE}>
            <CiCirclePlus size={20} />
            &nbsp;추가
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
export default PerformanceList
