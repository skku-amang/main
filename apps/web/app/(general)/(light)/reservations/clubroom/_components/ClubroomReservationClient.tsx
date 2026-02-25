"use client"
import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import dayjs from "dayjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ROUTES from "@/constants/routes"
import MyReservationField from "../../_components/MyReservationField"
import AddScheduleButton from "../../_components/AddScheduleButton"
import WeekCalendarField from "../../_components/WeekCalendarField"
import { useEffect, useState } from "react"
import isoWeek from "dayjs/plugin/isoWeek"
import WeekLabel from "../../_components/WeekLable"
import MonthCalendarField from "../../_components/MonthCalendarField"
import MobileCalendarField from "../../_components/MobileCalendarField"
dayjs.extend(isoWeek)

const ClubroomReservationClient = () => {
  // 현재 날짜 기준 "월요일"을 반환하는 함수
  const getMonday = (date = dayjs()) => date.startOf("isoWeek")

  // 현재 보고 있는 주의 시작일(월요일)
  const [currentMonday, setCurrentMonday] = useState(getMonday())

  // 현재 보고 있는 달 (Month View에서 사용됨)
  const [calendarViewMonth, setCalendarViewMonth] = useState(currentMonday)

  // currentMonday가 바뀔 때, month view도 동기화
  useEffect(() => {
    setCalendarViewMonth(currentMonday)
  }, [currentMonday])

  // 주간 캘린더 상단에 표시될 라벨 (예: "Sep 02–08, 2025")
  const weekLabel = `${currentMonday.format("MMM DD")}–${currentMonday.add(6, "day").format("DD, YYYY")}`

  // 월간 캘린더 상단에 표시될 라벨 (예: "September 2025")
  const monthLabel = calendarViewMonth.format("MMMM YYYY")

  // 월간 달력에 표시될 시작 날짜 (해당 달의 시작일 포함 주의 월요일)
  const calendarStart = calendarViewMonth.startOf("month").startOf("isoWeek")

  // 월간 달력에 채워질 날짜 배열 (6주 × 7일 = 42칸)
  const daysInCalendar = Array.from({ length: 42 }, (_, i) =>
    calendarStart.add(i, "day")
  )
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
          <MyReservationField />
        </div>
        <div className="w-3/4">
          <Tabs defaultValue="week">
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
            {/* 주간 캘린더 */}
            <TabsContent className="relative" value="week">
              <WeekCalendarField currentMonday={currentMonday} />
              <WeekLabel
                weekLabel={weekLabel}
                setCalendarViewMonth={setCalendarViewMonth}
                setCurrentMonday={setCurrentMonday}
                currentMonday={currentMonday}
                calendarViewMonth={calendarViewMonth}
                monthLabel={monthLabel}
                daysInCalendar={daysInCalendar}
                mode="week"
              />
              <AddScheduleButton className="absolute -top-[62px] right-0" />
            </TabsContent>
            {/* 월간 캘린더 */}
            <TabsContent value="month" className="relative">
              <MonthCalendarField currentMonday={currentMonday} />
              <WeekLabel
                weekLabel={weekLabel}
                setCalendarViewMonth={setCalendarViewMonth}
                setCurrentMonday={setCurrentMonday}
                currentMonday={currentMonday}
                calendarViewMonth={calendarViewMonth}
                monthLabel={monthLabel}
                daysInCalendar={daysInCalendar}
                mode="month"
              />
              <AddScheduleButton className="absolute -top-[62px] right-0" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {/* 모바일 페이지 */}
      <div className="max-w-[400px] relative md:hidden mx-auto pt-6">
        <MobileCalendarField currentMonday={currentMonday} />
        <WeekLabel
          weekLabel={weekLabel}
          setCalendarViewMonth={setCalendarViewMonth}
          setCurrentMonday={setCurrentMonday}
          currentMonday={currentMonday}
          calendarViewMonth={calendarViewMonth}
          monthLabel={monthLabel}
          daysInCalendar={daysInCalendar}
          mode="month"
          className="top-12 flex justify-between w-full px-5"
        />
      </div>
    </div>
  )
}

export default ClubroomReservationClient
