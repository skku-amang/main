import React from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export type FilterLabel = {
  id: number
  label: string
}

/**
 * 제목 필터 기준이 보이는 부분 (ex. 세션, 모집상태 등)
 */
export const FilterHeader = ({
  children,
  className
}: {
  children?: React.ReactNode
  className?: string
}) => {
  return (
    <div className={cn('text-lg font-semibold text-blue-950', className)}>
      {children}
    </div>
  )
}

/**
 * 체크박스를 감싸는 네모 박스를 정의하는 부분
 */
export const FilterCheckBoxContainer = ({ label }: { label: string }) => {
  return (
    <div className="flex h-[2.6rem] w-full items-center gap-2 font-medium">
      <Checkbox />
      <Label>{label}</Label>
    </div>
  )
}

const FilterSection = ({
  filterObject,
  header
}: {
  filterObject: FilterLabel[]
  header: React.ReactNode
}) => {
  return (
    <div className="relative h-full w-full p-5">
      <FilterHeader>{header}</FilterHeader>

      <div className="h-full w-full justify-center">
        {filterObject.map((filterLabel) => (
          <FilterCheckBoxContainer
            key={filterLabel.id}
            label={filterLabel.label}
          />
        ))}
      </div>
    </div>
  )
}

export default FilterSection
