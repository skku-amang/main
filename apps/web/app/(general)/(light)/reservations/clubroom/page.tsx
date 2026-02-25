"use client"
import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import dayjs from "dayjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ROUTES from "@/constants/routes"
import MyReservationField from "../_components/MyReservationSection"
import AddScheduleButton from "../_components/AddScheduleButton"
import WeekCalendarView from "../_components/WeekCalendarView"
import { useEffect, useState } from "react"
import isoWeek from "dayjs/plugin/isoWeek"
import WeekLabel from "../_components/WeekLable"
import MonthCalendarView from "../_components/MonthCalendarView"
import MobileCalendarSection from "../_components/MobileCalendarSection"
import MobileReservationSection from "../_components/MobileReservationSection"
dayjs.extend(isoWeek)

const ReservationPage = () => {
  const startOfIsoWeek = (date = dayjs()) => date.startOf("isoWeek")
  const [weekStartMonday, setWeekStartMonday] = useState(startOfIsoWeek())
  const [activeMonth, setActiveMonth] = useState(weekStartMonday)

  useEffect(() => {
    setActiveMonth(weekStartMonday)
  }, [weekStartMonday])

  const weekRangeLabel = `${weekStartMonday.format("MMM DD")}–${weekStartMonday
    .add(6, "day")
    .format("DD, YYYY")}`
  const monthTitleLabel = activeMonth.format("MMMM YYYY")
  const monthGridStartMonday = activeMonth.startOf("month").startOf("isoWeek")
  const monthGridDays = Array.from({ length: 42 }, (_, i) =>
    monthGridStartMonday.add(i, "day")
  )

  const fakeReservation = [
    {
      id: "0",
      start: "2025-09-27T09:00:00",
      end: "2025-09-27T09:59:00",
      user: "김수연 외 2명",
      title: "아침 회의"
    },
    {
      id: "1",
      start: "2025-09-28T10:30:00",
      end: "2025-09-28T11:29:00",
      user: "박지훈 외 1명",
      title: "스터디 모임"
    },
    {
      id: "2",
      start: "2025-09-28T12:00:00",
      end: "2025-09-28T12:59:00",
      user: "이민호 외 3명",
      title: "팀 점심 회식"
    },
    {
      id: "3",
      start: "2025-09-28T13:30:00",
      end: "2025-09-28T14:29:00",
      user: "최지현",
      title: "개인 상담"
    },
    {
      id: "4",
      start: "2025-09-28T15:00:00",
      end: "2025-09-28T15:59:00",
      user: "정은지 외 4명",
      title: "프로젝트 발표 연습"
    },
    {
      id: "5",
      start: "2025-09-28T16:00:00",
      end: "2025-09-28T16:59:00",
      user: "오세훈 외 2명",
      title: "스터디 그룹"
    },
    {
      id: "6",
      start: "2025-09-28T17:30:00",
      end: "2025-09-28T18:29:00",
      user: "김유진 외 1명",
      title: "과제 토론"
    }
  ]

  return (
    <div>
      <DefaultPageHeader
        title="동아리방 예약"
        routes={[
          { display: <DefaultHomeIcon />, href: ROUTES.HOME },
          { display: "예약" },
          { display: "동아리방 예약" }
        ]}
      />
      {/* PC 페이지 */}
      <div className={`w-full min-h-[739px] hidden md:flex gap-5`}>
        <div className="w-1/4">
          <MyReservationField myReservation={fakeReservation} />
        </div>
        <div className="w-3/4">
          <Tabs defaultValue="week">
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
            {/* 주간 캘린더 */}
            <TabsContent className="relative" value="week">
              <WeekCalendarView currentMonday={weekStartMonday} />
              <WeekLabel
                weekLabel={weekRangeLabel}
                setCalendarViewMonth={setActiveMonth}
                setCurrentMonday={setWeekStartMonday}
                currentMonday={weekStartMonday}
                calendarViewMonth={activeMonth}
                monthLabel={monthTitleLabel}
                daysInCalendar={monthGridDays}
                mode="week"
              />
              <AddScheduleButton className="absolute -top-[62px] right-0" />
            </TabsContent>
            {/* 월간 캘린더 */}
            <TabsContent value="month" className="relative">
              <MonthCalendarView currentMonday={weekStartMonday} />
              <WeekLabel
                weekLabel={weekRangeLabel}
                setCalendarViewMonth={setActiveMonth}
                setCurrentMonday={setWeekStartMonday}
                currentMonday={weekStartMonday}
                calendarViewMonth={activeMonth}
                monthLabel={monthTitleLabel}
                daysInCalendar={monthGridDays}
                mode="month"
              />
              <AddScheduleButton className="absolute -top-[62px] right-0" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {/* 모바일 페이지 */}
      <div className="max-w-[400px] relative md:hidden mx-auto pt-6">
        <MobileCalendarSection currentMonday={weekStartMonday} />
        <WeekLabel
          weekLabel={weekRangeLabel}
          setCalendarViewMonth={setActiveMonth}
          setCurrentMonday={setWeekStartMonday}
          currentMonday={weekStartMonday}
          calendarViewMonth={activeMonth}
          monthLabel={monthTitleLabel}
          daysInCalendar={monthGridDays}
          mode="month"
          className="top-12 flex justify-between w-full px-5"
        />
      </div>
      <div className="mx-auto max-w-[400px] md:hidden pt-3">
        <MobileReservationSection myReservation={fakeReservation} />
      </div>
    </div>
  )
}

export default ReservationPage
