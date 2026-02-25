import { Skeleton } from "@/components/ui/skeleton"

function TeamFormSkeleton() {
  return (
    <div className="w-full bg-white px-7 py-10 md:p-20">
      {/* 섹션 헤더 */}
      <Skeleton className="mb-2 h-7 w-40" />
      <Skeleton className="mb-6 h-4 w-64" />

      <div className="grid gap-x-14 gap-y-4 md:grid-cols-2 md:gap-y-6">
        {/* 공연 선택 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="hidden md:block" />

        {/* 곡명 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* 아티스트명 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* 디바이더 */}
      <Skeleton className="my-14 h-px w-full" />

      {/* 게시글 작성 */}
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-7 w-28" />
        <div className="hidden gap-x-2 md:flex">
          <Skeleton className="h-10 w-36 rounded-md" />
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-[180px] w-full rounded-md" />

      {/* 모바일 블록 */}
      <div className="mt-3 space-y-3 md:hidden">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>

      {/* 페이지네이션 */}
      <div className="mt-8 flex justify-center md:mt-24">
        <Skeleton className="h-10 w-48" />
      </div>
    </div>
  )
}

export default TeamFormSkeleton
