'use client'

import { createPerformance } from "@/lib/dummy/Performance"
import { generateDummys } from "@/lib/dummy"
import ROUTES from "../../../constants/routes"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CiCirclePlus } from "react-icons/ci";
import { memo, useMemo, useState } from "react"
import React from "react"
import PerformanceCard from "./PerformanceCard"

const MemoPerformanceCard = memo(PerformanceCard)

const PerformanceList = () => {
  const performances = useMemo(() => generateDummys(10, createPerformance), []);
  const [query, setQuery] = useState("");

  const filteredList = useMemo(() => {
    return performances.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  }, [performances, query]);

  return (
    <div className="mb-10">
      {/* 도구 모음 */}
      <div className="flex justify-between mb-3">
        <div className="flex gap-x-3">
          <Input
            className="w-72"
            onInput={e => setQuery(e.currentTarget.value)} />
          <Button>검색</Button>
        </div>

        <Button asChild className="flex items-center">
          <Link href={ROUTES.PERFORMANCE.CREATE.url}>
            <CiCirclePlus size={20} />&nbsp;추가
          </Link>
        </Button>
      </div>

      {/* 공연 카드 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredList.map((p) => (
          <div key={p.id} className="w-full flex justify-center">
            <MemoPerformanceCard
              id={p.id}
              name={p.name}
              representativeSrc={p.representativeImage}
              location={p.location}
              startDatetime={p.start_datetime}
              endDatetime={p.end_datetime}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default PerformanceList
