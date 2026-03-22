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
import { useEffect, useMemo, useState } from "react"
import { useQueryState, parseAsStringLiteral } from "nuqs"
import WeekLabel from "../../_components/WeekLable"
import MonthCalendarField from "../../_components/MonthCalendarField"
import MobileCalendarField from "../../_components/MobileCalendarField"
import { useRentals } from "@/hooks/api/useRental"
import { useEquipments } from "@/hooks/api/useEquipment"

const viewOptions = ["week", "month"] as const

export default function ClubroomReservationPage() {
  const [view, setView] = useQueryState(
    "view",
    parseAsStringLiteral(viewOptions).withDefault("week")
  )
  const getWeekStart = (date = dayjs()) => date.startOf("week")

  const [currentMonday, setCurrentMonday] = useState(getWeekStart())
  const [calendarViewMonth, setCalendarViewMonth] = useState(currentMonday)

  useEffect(() => {
    setCalendarViewMonth(currentMonday)
  }, [currentMonday])

  // 데이터 조회 범위: 현재 보고 있는 달의 시작~끝 (+전후 1주)
  const queryRange = useMemo(() => {
    const monthStart = calendarViewMonth
      .startOf("month")
      .startOf("week")
      .toDate()
    const monthEnd = calendarViewMonth.endOf("month").endOf("week").toDate()
    return { from: monthStart, to: monthEnd }
  }, [calendarViewMonth])

  const { data: rentals } = useRentals({
    type: "room",
    ...queryRange
  })
  const { data: equipments } = useEquipments("room")

  const weekLabel = `${currentMonday.format("MMM DD")}–${currentMonday.add(6, "day").format("DD, YYYY")}`
  const monthLabel = calendarViewMonth.format("MMMM, YYYY")
  const calendarStart = calendarViewMonth.startOf("month").startOf("week")
  const daysInCalendar = Array.from({ length: 42 }, (_, i) =>
    calendarStart.add(i, "day")
  )

  const rentalList = rentals ?? []
  const equipmentList = equipments ?? []

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
          <MyReservationField rentals={rentalList} />
        </div>
        <div className="w-3/4">
          <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
            {/* 주간 캘린더 */}
            <TabsContent className="relative" value="week">
              <WeekCalendarField
                currentMonday={currentMonday}
                rentals={rentalList}
              />
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
              <AddScheduleButton
                className="absolute -top-[62px] right-0"
                equipments={equipmentList}
              />
            </TabsContent>
            {/* 월간 캘린더 */}
            <TabsContent value="month" className="relative">
              <MonthCalendarField
                currentMonday={currentMonday}
                rentals={rentalList}
              />
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
              <AddScheduleButton
                className="absolute -top-[62px] right-0"
                equipments={equipmentList}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {/* 모바일 페이지 */}
      <div className="max-w-[400px] relative md:hidden mx-auto pt-6">
        <MobileCalendarField
          currentMonday={currentMonday}
          rentals={rentalList}
        />
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
