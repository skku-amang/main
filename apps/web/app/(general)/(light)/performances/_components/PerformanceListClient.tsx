"use client"

import { CirclePlus } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import {
  PastPerformanceCard,
  RecruitingPerformanceCard
} from "@/app/(general)/(light)/performances/_components/PerformanceCard"
import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import Search from "@/components/Search"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ROUTES from "@/constants/routes"
import { usePerformances } from "@/hooks/api/usePerformance"
import { splitPerformances } from "@/lib/performance"

const Section = ({
  title,
  children
}: {
  title: string
  children: ReactNode
}) => (
  <section className="mb-8">
    <h2 className="mb-3 text-lg font-semibold md:text-xl">{title}</h2>
    {children}
  </section>
)

const PerformanceListSkeleton = () => (
  <>
    <Skeleton className="mb-8 aspect-video w-full rounded-xl md:w-1/2" />
    <div className="grid gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-20 rounded-xl md:h-64" />
      ))}
    </div>
  </>
)

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
      <div className="mb-6 flex justify-between gap-x-2">
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

      {performances === undefined ? (
        <PerformanceListSkeleton />
      ) : (
        <PerformanceSections performances={performances} />
      )}
    </div>
  )
}

const PerformanceSections = ({
  performances
}: {
  performances: NonNullable<ReturnType<typeof usePerformances>["data"]>
}) => {
  const { recruiting, ongoing, past } = splitPerformances(performances)

  if (performances.length === 0) {
    return (
      <p className="py-16 text-center text-slate-500">
        아직 등록된 공연이 없어요.
      </p>
    )
  }

  return (
    <>
      {recruiting.length > 0 && (
        <Section title="모집 중">
          <div className="grid gap-5 md:grid-cols-2">
            {recruiting.map((p) => (
              <RecruitingPerformanceCard
                key={p.id}
                id={p.id}
                name={p.name}
                posterSrc={p.image}
                location={p.location}
                startAt={p.startAt}
                recruitEndAt={p.recruitEndAt}
              />
            ))}
          </div>
        </Section>
      )}

      {ongoing.length > 0 && (
        <Section title="진행 중">
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white shadow-sm md:grid md:grid-cols-3 md:gap-5 md:divide-y-0 md:overflow-visible md:rounded-none md:bg-transparent md:shadow-none xl:grid-cols-4">
            {ongoing.map((p) => (
              <PastPerformanceCard
                key={p.id}
                id={p.id}
                name={p.name}
                posterSrc={p.image}
                location={p.location}
                startAt={p.startAt}
                recruitEndAt={p.recruitEndAt}
                schedule={p}
              />
            ))}
          </div>
        </Section>
      )}

      {past.length > 0 && (
        <Section title="지난 공연">
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white shadow-sm md:grid md:grid-cols-3 md:gap-5 md:divide-y-0 md:overflow-visible md:rounded-none md:bg-transparent md:shadow-none xl:grid-cols-4">
            {past.map((p) => (
              <PastPerformanceCard
                key={p.id}
                id={p.id}
                name={p.name}
                posterSrc={p.image}
                location={p.location}
                startAt={p.startAt}
                recruitEndAt={p.recruitEndAt}
              />
            ))}
          </div>
        </Section>
      )}
    </>
  )
}

export default PerformanceListClient
