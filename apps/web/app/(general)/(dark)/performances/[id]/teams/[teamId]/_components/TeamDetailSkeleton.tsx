import OleoPageHeader from "@/components/PageHeaders/OleoPageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import ROUTES from "@/constants/routes"

interface TeamDetailSkeletonProps {
  performanceId: number
}

const BasicInfoSkeleton = () => (
  <div className="relative h-fit w-full rounded-2xl bg-white px-10 py-14 shadow-md md:w-[466px] md:px-[40px] md:py-[60px]">
    {/* 뱃지 */}
    <Skeleton className="mb-[10px] h-[20px] w-[72px] md:mb-[16px] md:h-[32px] md:w-[130px]" />

    {/* 팀장: 아바타 + 이름 + 시간 */}
    <div className="mb-6 flex items-center gap-x-[8px] md:mb-[24px] md:gap-x-[10px]">
      <Skeleton className="h-[24px] w-[24px] rounded-full md:h-[48px] md:w-[48px]" />
      <Skeleton className="h-3 w-16 md:h-4 md:w-20" />
      <Skeleton className="h-3 w-12 md:h-4 md:w-16" />
    </div>

    {/* 곡명 + 상태뱃지 */}
    <div className="flex items-center justify-between gap-x-3">
      <Skeleton className="h-7 w-40 md:h-8 md:w-52" />
      <Skeleton className="h-5 w-20 rounded-full md:h-[32px] md:w-[130px]" />
    </div>

    {/* 아티스트 */}
    <Skeleton className="mt-1 h-5 w-28 md:h-[34px] md:w-36" />

    {/* 설명 */}
    <div className="space-y-2 pt-[14px] md:pt-[28px]">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
)

const SessionSetCardSkeleton = ({
  header,
  children
}: {
  header: string
  children: React.ReactNode
}) => (
  <div className="rounded-xl border-s-8 border-s-blue-900 bg-white px-[40px] py-[40px] shadow-md md:px-[68px] md:py-[56px]">
    <h5 className="select-none text-base font-bold leading-[18px] text-slate-700 md:text-2xl md:leading-normal">
      {header}
    </h5>
    {children}
  </div>
)

const TeamDetailSkeleton = ({ performanceId }: TeamDetailSkeletonProps) => {
  return (
    <div className="container flex w-full flex-col items-center px-0 pt-16">
      {/* 기울어진 배경 */}
      <div
        className="absolute left-0 top-0 z-0 h-[283px] w-full bg-slate-300 md:h-[600px]"
        style={{ clipPath: "polygon(0 0%, 80% 0, 180% 65%, 0% 100%)" }}
      />
      <div
        className="absolute left-0 top-0 h-[283px] w-full bg-primary md:h-[600px]"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 60%, 0% 100%)" }}
      />

      {/* 페이지 헤더 */}
      <OleoPageHeader
        title="Join Your Team"
        goBackHref={ROUTES.PERFORMANCE.TEAM.LIST(performanceId)}
        className="relative mb-10"
      />

      {/* YouTube 영역 */}
      <div className="relative z-10 flex w-full items-center justify-center pb-[20px] md:pb-[49px]">
        <Skeleton className="mx-10 aspect-video h-auto w-full rounded-lg md:h-[673px] md:w-[1152px]" />
      </div>

      <div className="flex w-full gap-[24px] max-md:flex-col max-md:items-center md:flex md:w-[1152px]">
        {/* 왼쪽: BasicInfo + 포스터 */}
        <div className="flex w-full flex-col gap-y-[24px]">
          <BasicInfoSkeleton />
          {/* 포스터 (데스크톱) */}
          <Skeleton className="hidden h-[400px] w-full rounded-lg md:block" />
        </div>

        {/* 오른쪽: 세션 카드들 */}
        <div className="flex h-full w-[93%] flex-col gap-y-5 md:w-[662px]">
          {/* 세션구성 */}
          <SessionSetCardSkeleton header="세션구성">
            <div className="flex flex-wrap gap-x-2 gap-y-2 pt-[20px] md:pt-[40px]">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-[22px] w-[56px] rounded md:h-[34px] md:w-[74px] md:rounded-[20px]"
                />
              ))}
            </div>
          </SessionSetCardSkeleton>

          {/* 마감된 세션 */}
          <SessionSetCardSkeleton header="마감된 세션">
            <div className="mt-4">
              {/* 테이블 헤더 (데스크톱) */}
              <div className="hidden items-center text-sm font-medium text-slate-500 md:flex">
                <div className="flex h-[48px] w-[160px] items-center pl-4">
                  Session
                </div>
                <div className="flex h-[48px] w-[466px] items-center pl-4">
                  Member
                </div>
              </div>
              <div className="hidden h-[1.5px] w-full bg-slate-200 md:block" />
              {/* 멤버 행 */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 border-b border-slate-100 py-3"
                >
                  <Skeleton className="h-6 w-14 rounded-full" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </SessionSetCardSkeleton>

          {/* 세션 지원 */}
          <SessionSetCardSkeleton header="세션 지원">
            {/* 안내 텍스트 */}
            <div className="space-y-2 pt-[12px] md:pt-[16px]">
              <Skeleton className="h-3 w-full md:w-[537px]" />
              <Skeleton className="h-3 w-5/6 md:w-[480px]" />
            </div>

            {/* 세션 버튼 그리드 */}
            <div className="mt-6 grid grid-cols-2 gap-3 md:flex md:flex-wrap">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-10 rounded-md md:h-10 md:w-[120px]"
                />
              ))}
            </div>
          </SessionSetCardSkeleton>
        </div>
      </div>
    </div>
  )
}

export default TeamDetailSkeleton
