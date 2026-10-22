import { TabsList, TabsTrigger } from "@/components/ui/tabs"

/** 예약 달력 주/월 전환 버튼 — 감싸는 Tabs의 value는 "week" | "month" */
export default function ViewTabsList() {
  return (
    <TabsList>
      <TabsTrigger value="week">주</TabsTrigger>
      <TabsTrigger value="month">월</TabsTrigger>
    </TabsList>
  )
}
