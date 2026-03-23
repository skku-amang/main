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
import MobileTimeSlots from "../../_components/MobileCalendarField/MobileTimeSlots"
import MobileMyReservations from "../../_components/MobileCalendarField/MobileMyReservations"
import { useRentals } from "@/hooks/api/useRental"
import { useEquipments } from "@/hooks/api/useEquipment"
import { RentalDetail } from "@repo/shared-types"
import RentalDetailModal from "../../_components/RentalDetailModal"
import { Dayjs } from "dayjs"

const viewOptions = ["week", "month"] as const
const mobileTabOptions = ["schedule", "my"] as const

export default function ClubroomReservationPage() {
  const [view, setView] = useQueryState(
    "view",
    parseAsStringLiteral(viewOptions).withDefault("week")
  )
  const [mobileTab, setMobileTab] = useQueryState(
    "tab",
    parseAsStringLiteral(mobileTabOptions).withDefault("schedule")
  )
  const [selectedRental, setSelectedRental] = useState<RentalDetail | null>(
    null
  )
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
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
    <div className="bg-neutral-50 -mx-6 px-6 md:-mx-0 md:px-0">
      <DefaultPageHeader
        title="동아리방 예약"
        routes={[
          { display: <DefaultHomeIcon />, href: ROUTES.HOME },
          { display: "예약" },
          { display: "동아리방 예약" }
        ]}
      />
      {/* PC 페이지 */}
      <div className="hidden w-full min-h-[739px] gap-5 md:flex">
        <div className="w-[280px] shrink-0">
          <MyReservationField
            rentals={rentalList}
            onRentalClick={setSelectedRental}
          />
        </div>
        <div className="flex-1 min-w-0">
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
                onRentalClick={setSelectedRental}
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
      <div className="relative mx-auto max-w-[400px] md:hidden">
        {/* Calendar with month navigation */}
        <MobileCalendarField
          currentMonday={currentMonday}
          rentals={rentalList}
          onDateSelect={setSelectedDate}
          selectedDate={selectedDate}
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
          className="top-12 flex w-full justify-between px-5"
        />

        {/* Mobile tab buttons (pill style matching Figma) */}
        <div className="flex gap-2 px-4 py-3">
          <button
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              mobileTab === "schedule"
                ? "bg-blue-600 text-white"
                : "bg-white text-neutral-700 hover:bg-gray-100"
            }`}
            onClick={() => setMobileTab("schedule")}
          >
            예약 현황
          </button>
          <button
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              mobileTab === "my"
                ? "bg-blue-600 text-white"
                : "bg-white text-neutral-700 hover:bg-gray-100"
            }`}
            onClick={() => setMobileTab("my")}
          >
            나의 예약
          </button>
        </div>

        {/* Mobile tab content */}
        <div className="bg-white px-3 pb-20">
          {mobileTab === "schedule" ? (
            <MobileTimeSlots
              selectedDate={selectedDate}
              rentals={rentalList}
              onRentalClick={setSelectedRental}
            />
          ) : (
            <MobileMyReservations
              rentals={rentalList}
              onRentalClick={setSelectedRental}
            />
          )}
        </div>
      </div>

      <RentalDetailModal
        rental={selectedRental}
        open={!!selectedRental}
        onOpenChange={(open) => {
          if (!open) setSelectedRental(null)
        }}
      />
    </div>
  )
}
