import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MobileReservationStatusCard from "./MobileReservationStatusCard"
import MobileMyReservationCard from "./MobileMyReservationCard"

const fakeReservation = [
  {
    start: "2025-09-21T09:00:00",
    end: "2025-09-21T09:59:00",
    user: "김수연 외 2명",
    title: "아침 회의"
  },
  {
    start: "2025-09-21T10:30:00",
    end: "2025-09-21T11:29:00",
    user: "박지훈 외 1명",
    title: "스터디 모임"
  },
  {
    start: "2025-09-21T12:00:00",
    end: "2025-09-21T12:59:00",
    user: "이민호 외 3명",
    title: "팀 점심 회식"
  },
  {
    start: "2025-09-21T13:30:00",
    end: "2025-09-21T14:29:00",
    user: "최지현",
    title: "개인 상담"
  },
  {
    start: "2025-09-21T15:00:00",
    end: "2025-09-21T15:59:00",
    user: "정은지 외 4명",
    title: "프로젝트 발표 연습"
  },
  {
    start: "2025-09-21T16:00:00",
    end: "2025-09-21T16:59:00",
    user: "오세훈 외 2명",
    title: "스터디 그룹"
  },
  {
    start: "2025-09-21T17:30:00",
    end: "2025-09-21T18:29:00",
    user: "김유진 외 1명",
    title: "과제 토론"
  },
  {
    start: "2025-09-21T18:30:00",
    end: "2025-09-21T19:29:00",
    user: "박민지 외 3명",
    title: "저녁 회식"
  },
  {
    start: "2025-09-21T19:30:00",
    end: "2025-09-21T20:29:00",
    user: "이도현",
    title: "개인 연구"
  },
  {
    start: "2025-09-21T21:00:00",
    end: "2025-09-21T21:59:00",
    user: "윤아람 외 2명",
    title: "동아리 모임"
  }
]

export default function MobileReservationField() {
  return (
    <Tabs defaultValue="reservationStatus" className="w-full">
      <TabsList className="flex h-14 *:h-full *:text-lg bg-neutral-50 justify-center gap-3">
        <TabsTrigger
          value="reservationStatus"
          className="flex-1 data-[state=active]:bg-third rounded-xl data-[state=active]:text-white bg-white text-neutral-700"
        >
          예약 현황
        </TabsTrigger>
        <TabsTrigger
          value="myReservations"
          className="flex-1 data-[state=active]:bg-third rounded-xl data-[state=active]:text-white bg-white text-neutral-700"
        >
          나의 예약
        </TabsTrigger>
      </TabsList>
      <TabsContent value="reservationStatus" className="w-full">
        <MobileReservationStatusCard />
      </TabsContent>
      <TabsContent
        value="myReservations"
        className="w-full flex flex-col gap-3"
      >
        {fakeReservation.map((reservation, i) => (
          <MobileMyReservationCard key={i} reservation={reservation} />
        ))}
      </TabsContent>
    </Tabs>
  )
}
