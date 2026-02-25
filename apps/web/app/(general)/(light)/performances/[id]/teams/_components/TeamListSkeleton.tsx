import { Skeleton } from "@/components/ui/skeleton"

const TableRowSkeleton = () => (
  <tr className="bg-white drop-shadow-[0_1px_2px_rgb(0,0,0,0.06)]">
    {/* 곡명 */}
    <td className="rounded-l-lg p-4">
      <Skeleton className="mb-1.5 h-4 w-32" />
      <Skeleton className="h-3 w-20" />
    </td>
    {/* 팀장 */}
    <td className="p-4">
      <div className="flex justify-center">
        <Skeleton className="h-4 w-16" />
      </div>
    </td>
    {/* 필요세션 */}
    <td className="p-4">
      <div className="flex gap-1">
        <Skeleton className="h-6 w-12 rounded-[5px]" />
        <Skeleton className="h-6 w-12 rounded-[5px]" />
        <Skeleton className="h-6 w-12 rounded-[5px]" />
      </div>
    </td>
    {/* 모집상태 */}
    <td className="p-4">
      <div className="flex justify-center">
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </td>
    {/* 영상링크 */}
    <td className="p-4">
      <div className="flex justify-center">
        <Skeleton className="h-5 w-5 rounded" />
      </div>
    </td>
    {/* 액션 */}
    <td className="rounded-r-lg p-4">
      <div className="flex justify-center">
        <Skeleton className="h-5 w-4 rounded" />
      </div>
    </td>
  </tr>
)

const CardSkeleton = () => (
  <div className="rounded-lg bg-white p-5 shadow-md">
    {/* 곡명 & 상태 */}
    <div className="flex items-start justify-between">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>

    {/* 아티스트 */}
    <Skeleton className="mt-2 h-4 w-20" />

    {/* 팀장 */}
    <div className="mt-3 flex items-center justify-between">
      <Skeleton className="h-3 w-10" />
      <div className="flex items-center gap-x-3">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>

    {/* 필요세션 */}
    <div className="mt-4 flex items-center justify-between">
      <Skeleton className="h-3 w-14" />
      <div className="flex gap-1">
        <Skeleton className="h-6 w-10 rounded-lg" />
        <Skeleton className="h-6 w-10 rounded-lg" />
        <Skeleton className="h-6 w-10 rounded-lg" />
      </div>
    </div>
  </div>
)

const TeamListSkeleton = () => {
  return (
    <div>
      {/* 헤더 */}
      <div className="flex flex-col justify-center space-y-1 pb-2 pt-10 text-center md:space-y-5 md:pb-[91px] md:pt-[135px]">
        <Skeleton className="mx-auto h-8 w-40 md:h-12 md:w-60" />
        <div className="hidden items-center justify-center gap-2 md:flex">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* 데스크톱: 테이블 */}
      <div className="hidden md:block">
        {/* 검색 + 버튼 */}
        <div className="flex items-center justify-between py-[25px]">
          <Skeleton className="h-10 w-[300px] rounded-full" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-[136px] rounded-full" />
            <Skeleton className="h-10 w-[136px] rounded-full" />
          </div>
        </div>

        {/* 테이블 */}
        <table className="w-full border-separate border-spacing-y-1">
          <thead>
            <tr>
              <th className="border-y border-gray-200 bg-gray-100 p-3 text-left text-sm font-semibold text-neutral-600 first:rounded-l-lg first:border-l last:rounded-r-lg last:border-r">
                곡명
              </th>
              <th className="border-y border-gray-200 bg-gray-100 p-3 text-center text-sm font-semibold text-neutral-600">
                팀장
              </th>
              <th className="border-y border-gray-200 bg-gray-100 p-3 text-left text-sm font-semibold text-neutral-600">
                필요 세션
              </th>
              <th className="border-y border-gray-200 bg-gray-100 p-3 text-center text-sm font-semibold text-neutral-600">
                모집상태
              </th>
              <th className="border-y border-gray-200 bg-gray-100 p-3 text-center text-sm font-semibold text-neutral-600">
                영상링크
              </th>
              <th className="border-y border-gray-200 bg-gray-100 p-3 text-sm font-semibold text-neutral-600 last:rounded-r-lg last:border-r" />
            </tr>
          </thead>
          <tbody className="[&_tr]:mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-center space-x-2 pb-6 pt-14">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-16 rounded-md" />
        </div>
      </div>

      {/* 모바일: 카드 */}
      <div className="mb-4 mt-6 md:hidden">
        {/* 검색, 필터, 정렬 */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-x-3">
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
            <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
          </div>

          {/* 공연선택 + 생성 버튼 */}
          <div className="grid grid-cols-2 gap-x-4">
            <Skeleton className="h-9 rounded-lg" />
            <Skeleton className="h-9 rounded-lg" />
          </div>
        </div>

        <div className="my-3 h-[1px] w-full bg-slate-200" />

        {/* 카드 목록 */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TeamListSkeleton
