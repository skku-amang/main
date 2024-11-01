import { useReactTable } from "@tanstack/react-table"
import { ArrowDownUp, CirclePlus, Filter } from "lucide-react"
import Link from "next/link"

import RelatedPerformanceList from "@/app/(general)/performances/[id]/teams/_components/RelatedPerformanceList"
import { TeamColumn } from "@/app/(general)/performances/[id]/teams/_components/TeamListData/columns"
import TeamListTableFilter, {
  FilterValue
} from "@/app/(general)/performances/[id]/teams/_components/TeamListData/filter"
import MobileButton from "@/app/(general)/performances/[id]/teams/_components/TeamListData/MobileButton"
import TeamCard from "@/app/(general)/performances/[id]/teams/_components/TeamListData/TeamCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import ROUTES from "@/constants/routes"
import { Performance } from "@/types/Performance"

interface TeamListCardProps {
  table: ReturnType<typeof useReactTable<TeamColumn>>
  performanceId: number
  relatedPerformances: Performance[]
  filterValues: { [key: string]: FilterValue[] }
}

const TeamListCard = ({
  table,
  performanceId,
  relatedPerformances,
  filterValues
}: TeamListCardProps) => {
  return (
    <div>
      {/* 헤더 */}
      <div className="space-y-3">
        {/* 검색, 필터, 정렬 */}
        <div className="flex justify-center gap-x-3">
          {/* 검색 */}
          <Input
            placeholder="검색"
            value={
              (table.getColumn("songName")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("songName")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />

          {/* 필터 */}
          <Popover>
            <PopoverTrigger>
              <MobileButton asChild variant="outline" className="px-2 py-3">
                <div>
                  <Filter />
                </div>
              </MobileButton>
            </PopoverTrigger>
            <PopoverContent className="flex gap-8 p-8">
              <TeamListTableFilter
                header="필요세션"
                filterValues={filterValues.필요세션}
              />
              <Separator orientation="vertical" className="h-64" />
              <TeamListTableFilter
                header="모집상태"
                filterValues={filterValues.모집상태}
              />
            </PopoverContent>
          </Popover>

          {/* 정렬 */}
          {/* TODO: 정렬 기능 구현 */}
          <MobileButton asChild variant="outline">
            <div>
              <ArrowDownUp strokeWidth={1.75} />
            </div>
          </MobileButton>
        </div>

        {/* 공연 선택 및 생성 버튼 */}
        <div className="grid grid-cols-2 gap-2">
          {/* 연관된 공연 목록 */}
          <RelatedPerformanceList
            currentPerformanceId={performanceId}
            relatedPerformances={relatedPerformances}
          />

          {/* 생성 버튼 */}
          <Button asChild className="h-full rounded-md py-1">
            <Link href={ROUTES.TEAM.CREATE.url}>
              <CirclePlus size={22} />
              &nbsp;Create
            </Link>
          </Button>
        </div>
      </div>

      <Separator orientation="horizontal" className="my-3" />

      <div className="space-y-3">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <div key={row.id}>
              {/* TODO: image 추가 */}
              <TeamCard
                id={row.original.id}
                songName={row.original.songName}
                songArtist={row.original.songArtist}
                // image={row.original}
                leaderName={row.original.leaderName}
                memberSessions={row.original.memberSessions ?? []}
              />
            </div>
          ))
        ) : (
          <div>결과 없음</div>
        )}
      </div>
    </div>
  )
}

export default TeamListCard
