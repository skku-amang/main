'use client'

import Link from 'next/link'
import { memo, useMemo, useState } from 'react'
import React from 'react'
import { CiCirclePlus } from 'react-icons/ci'

import ROUTES from '../../../../constants/routes'
import { generateDummys } from '../../../../lib/dummy'
import { createPerformance } from '../../../../lib/dummy/Performance'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import PerformanceCard from './PerformanceCard'

const MemoPerformanceCard = memo(PerformanceCard)

const PerformanceList = () => {
  const performances = useMemo(() => generateDummys(10, createPerformance), [])
  const [query, setQuery] = useState('')

  const filteredList = useMemo(() => {
    return performances.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    )
  }, [performances, query])

  return (
    <div className="mb-10">
      {/* 도구 모음 */}
      <div className="mb-3 flex justify-between">
        <div className="flex gap-x-3">
          <Input
            className="w-72"
            onInput={(e) => setQuery(e.currentTarget.value)}
          />
          <Button>검색</Button>
        </div>

        <Button asChild className="flex items-center">
          <Link href={ROUTES.PERFORMANCE.CREATE.url}>
            <CiCirclePlus size={20} />
            &nbsp;추가
          </Link>
        </Button>
      </div>

      {/* 공연 카드 목록 */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredList.map((p) => (
          <div key={p.id} className="flex w-full justify-center">
            <MemoPerformanceCard
              id={p.id}
              name={p.name}
              representativeSrc={p.representativeImage}
              location={p.location}
              startDatetime={p.start_datetime}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default PerformanceList
