"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { CalendarDays, Clock, MapPin, Users } from "lucide-react"
import { LuMusic } from "react-icons/lu"

import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ROUTES from "@/constants/routes"
import { usePerformance } from "@/hooks/api/usePerformance"

const formatDate = (date: Date) => {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  })
}

const PosterImage = ({ alt, src }: { alt: string; src: string | null }) => {
  if (!src) {
    return (
      <div className="flex aspect-[3/2] w-full items-center justify-center rounded-xl bg-slate-100">
        <LuMusic className="size-16 text-slate-300" />
      </div>
    )
  }

  return (
    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl">
      <Image alt={alt} src={src} fill className="object-cover" />
    </div>
  )
}

const InfoItem = ({
  icon,
  children
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) => (
  <div className="flex items-center gap-2 text-sm text-slate-600">
    {icon}
    <span>{children}</span>
  </div>
)

const DetailSkeleton = () => (
  <div>
    <DefaultPageHeader title={<Skeleton className="mx-auto h-8 w-48" />} />
    <div className="flex flex-col gap-8 md:flex-row">
      <Skeleton className="aspect-[3/2] w-full shrink-0 rounded-xl md:w-[400px]" />
      <div className="w-full space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="mt-6 h-24 w-full rounded-xl" />
      </div>
    </div>
  </div>
)

const PerformanceDetailClient = () => {
  const params = useParams()
  const { id } = params
  const performanceId = Number(id)

  const { data: performance, status } = usePerformance(performanceId)

  if (status === "pending") {
    return <DetailSkeleton />
  }

  if (status === "error" || performance === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-4 text-lg text-slate-500">
          공연 정보를 불러올 수 없습니다.
        </p>
        <Button asChild variant="outline">
          <Link href={ROUTES.PERFORMANCE.LIST}>목록으로 돌아가기</Link>
        </Button>
      </div>
    )
  }

  const startDate = performance.startAt ? new Date(performance.startAt) : null
  const endDate = performance.endAt ? new Date(performance.endAt) : null

  return (
    <div>
      <DefaultPageHeader
        title={performance.name}
        routes={[
          { display: <DefaultHomeIcon />, href: ROUTES.HOME },
          { display: "공연 목록", href: ROUTES.PERFORMANCE.LIST },
          { display: performance.name }
        ]}
      />

      <div className="flex flex-col gap-8 md:flex-row">
        {/* 포스터 */}
        <div className="w-full shrink-0 md:w-[400px]">
          <PosterImage
            alt={`${performance.name} 포스터`}
            src={performance.posterImage}
          />
        </div>

        {/* 정보 */}
        <div className="flex w-full flex-col gap-5">
          {/* 메타 정보 */}
          <div className="space-y-3">
            {startDate && (
              <InfoItem icon={<CalendarDays className="size-4 shrink-0" />}>
                {formatDate(startDate)}
                {endDate &&
                  startDate.toDateString() !== endDate.toDateString() &&
                  ` ~ ${formatDate(endDate)}`}
              </InfoItem>
            )}

            {startDate && (
              <InfoItem icon={<Clock className="size-4 shrink-0" />}>
                {formatTime(startDate)}
                {endDate && ` ~ ${formatTime(endDate)}`}
              </InfoItem>
            )}

            {performance.location && (
              <InfoItem icon={<MapPin className="size-4 shrink-0" />}>
                {performance.location}
              </InfoItem>
            )}
          </div>

          {/* 설명 */}
          {performance.description && (
            <p className="rounded-xl bg-slate-50 p-5 text-sm leading-relaxed text-slate-600">
              {performance.description}
            </p>
          )}

          {/* 팀 목록 바로가기 */}
          <Button asChild className="w-fit rounded-full">
            <Link href={ROUTES.PERFORMANCE.TEAM.LIST(performanceId)}>
              <Users className="mr-2 size-4" />팀 목록 보기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PerformanceDetailClient
