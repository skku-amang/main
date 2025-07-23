"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import ROUTES from "@/constants/routes"
import { Performance } from "@repo/shared-types"

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
    <Select
      value={currentPerformanceId.toString()}
      onValueChange={(performanceId) =>
        router.push(ROUTES.PERFORMANCE.TEAM.LIST(+performanceId))
      }
    >
      <SelectTrigger className="flex-row-reverse gap-x-2 text-gray-500">
        <SelectValue placeholder={currentPerformance?.name} />
      </SelectTrigger>
      <SelectContent>
        {performanceOptions.map((p) => (
          <SelectItem key={p.id} value={p.id.toString()}>
            <Link href={ROUTES.PERFORMANCE.TEAM.LIST(p.id)}>{p.name}</Link>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default SelectView
