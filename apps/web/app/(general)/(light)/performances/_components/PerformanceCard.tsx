"use client"

import "dayjs/locale/ko"
import dayjs from "dayjs"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { IoLocationSharp } from "react-icons/io5"
import { LuMusic } from "react-icons/lu"

import { Button } from "@/components/ui/button"
import ROUTES from "@/constants/routes"
import { formatDday, getRecruitDaysLeft } from "@/lib/performance"
import { cn } from "@/lib/utils"

interface PerformanceCardProp {
  id: number
  name: string
  posterSrc: string | null
  location: string | null
  startAt: Date | null
  endAt: Date | null
}

const formatDate = (date: Date | null) =>
  date ? dayjs(date).locale("ko").format("YYYY.MM.DD (ddd)") : "일시 미정"

const PosterImage = ({
  alt,
  src,
  className
}: {
  alt: string
  src: string | null
  className?: string
}) => (
  <div
    className={cn(
      "relative flex shrink-0 items-center justify-center overflow-hidden bg-slate-100",
      className
    )}
  >
    {src ? (
      <Image alt={alt} src={src} fill className="object-cover" />
    ) : (
      <LuMusic className="size-1/4 text-slate-300" />
    )}
  </div>
)

const Location = ({ location }: { location: string | null }) =>
  location && (
    <p className="flex min-w-0 items-center gap-1 text-sm text-slate-500">
      <IoLocationSharp className="shrink-0" />
      <span className="truncate">{location}</span>
    </p>
  )

export const RecruitingPerformanceCard = ({
  id,
  name,
  posterSrc,
  location,
  startAt,
  endAt
}: PerformanceCardProp) => {
  const daysLeft = getRecruitDaysLeft({ endAt })

  return (
    <div className="relative overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-lg">
      <PosterImage
        alt={`${name} 포스터`}
        src={posterSrc}
        className="aspect-video w-full"
      />
      <div className="flex flex-col gap-1 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold leading-snug md:text-xl">
            {/* 카드 전체를 덮는 링크 — 안쪽 팀 목록 버튼과 링크가 겹치지 않게 */}
            <Link
              href={ROUTES.PERFORMANCE.DETAIL(id)}
              className="after:absolute after:inset-0"
            >
              {name}
            </Link>
          </h3>
          {daysLeft !== undefined && daysLeft >= 0 && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
              {formatDday(daysLeft)}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500">
          {formatDate(startAt)} 공연
          {endAt && ` · ${formatDate(endAt)} 모집 마감`}
        </p>
        <Location location={location} />
        <Button asChild className="relative mt-3 w-full md:w-fit">
          <Link href={ROUTES.PERFORMANCE.TEAM.LIST(id)}>
            팀 목록 보기
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

// 모바일은 한 줄 목록, md 이상은 세로 카드
export const PastPerformanceCard = ({
  id,
  name,
  posterSrc,
  location,
  startAt
}: PerformanceCardProp) => (
  <Link
    href={ROUTES.PERFORMANCE.DETAIL(id)}
    className="flex items-center gap-3 p-3 transition-colors hover:bg-slate-50 md:flex-col md:items-stretch md:gap-0 md:overflow-hidden md:rounded-xl md:bg-white md:p-0 md:shadow-sm md:transition-shadow md:hover:bg-white md:hover:shadow-lg"
  >
    <PosterImage
      alt={`${name} 포스터`}
      src={posterSrc}
      className="aspect-[3/2] w-24 rounded-md md:w-full md:rounded-none"
    />
    <div className="flex min-w-0 flex-1 flex-col gap-0.5 md:p-4">
      <h3 className="truncate font-semibold">{name}</h3>
      <p className="text-sm text-slate-500">{formatDate(startAt)}</p>
      <Location location={location} />
    </div>
    <ChevronRight className="size-5 shrink-0 text-slate-300 md:hidden" />
  </Link>
)
