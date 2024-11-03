"use client"

import { useRouter } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import ROUTES from "@/constants/routes"
import { Performance } from "@/types/Performance"

interface SelectViewProps {
  currentPerformanceId: number
  performanceOptions: Performance[]
}

const SelectView = ({
  currentPerformanceId,
  performanceOptions
}: SelectViewProps) => {
  const currentPerformance = performanceOptions.find(
    (p) => p.id === +currentPerformanceId
  )
  const router = useRouter()

  return (
    <Select onValueChange={id => router.push(ROUTES.PERFORMANCE.DETAIL(+id))}>
      <SelectTrigger className="font-semibold text-gray-400">
        <SelectValue placeholder={currentPerformance?.name ?? "공연 선택"} />
      </SelectTrigger>
      <SelectContent>
        {performanceOptions.map((p) => (
          <SelectItem
            key={p.id}
            value={p.id.toString()}
          >
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default SelectView
