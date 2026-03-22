"use client"

import { useEffect, useMemo, useState } from "react"
import { useQueryState, parseAsStringLiteral } from "nuqs"
import { useParams } from "next/navigation"
import Link from "next/link"
import dayjs, { Dayjs } from "dayjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import ROUTES from "@/constants/routes"
import { useEquipment } from "@/hooks/api/useEquipment"
import { useRentals } from "@/hooks/api/useRental"
import MyReservationField from "../../../_components/MyReservationField"
import AddScheduleButton from "../../../_components/AddScheduleButton"
import WeekCalendarField from "../../../_components/WeekCalendarField"
import WeekLabel from "../../../_components/WeekLable"
import MonthCalendarField from "../../../_components/MonthCalendarField"
import MobileCalendarField from "../../../_components/MobileCalendarField"
import MobileTimeSlots from "../../../_components/MobileCalendarField/MobileTimeSlots"
import MobileMyReservations from "../../../_components/MobileCalendarField/MobileMyReservations"
import RentalDetailModal from "../../../_components/RentalDetailModal"
import { RentalDetail } from "@repo/shared-types"

const viewOptions = ["week", "month"] as const
const mobileTabOptions = ["schedule", "my"] as const

export default function EquipmentCalendarPage() {
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
  const params = useParams()
  const equipmentId = Number(params.id)
  const { data: equipmentDetail } = useEquipment(equipmentId)

  const getWeekStart = (date = dayjs()) => date.startOf("week")
  const [currentMonday, setCurrentMonday] = useState(getWeekStart())
  const [calendarViewMonth, setCalendarViewMonth] = useState(currentMonday)

  useEffect(() => {
    setCalendarViewMonth(currentMonday)
  }, [currentMonday])

  const queryRange = useMemo(() => {
    const monthStart = calendarViewMonth
      .startOf("month")
      .startOf("week")
      .toDate()
    const monthEnd = calendarViewMonth.endOf("month").endOf("week").toDate()
    return { from: monthStart, to: monthEnd }
  }, [calendarViewMonth])

  const { data: rentals } = useRentals({
    equipmentId,
    ...queryRange
  })

  const weekLabel = `${currentMonday.format("MMM DD")}–${currentMonday.add(6, "day").format("DD, YYYY")}`
  const monthLabel = calendarViewMonth.format("MMMM, YYYY")
  const calendarStart = calendarViewMonth.startOf("month").startOf("week")
  const daysInCalendar = Array.from({ length: 42 }, (_, i) =>
    calendarStart.add(i, "day")
  )

  const rentalList = rentals ?? []
  const equipmentForSchedule = equipmentDetail ? [equipmentDetail] : []

  const equipmentLabel = equipmentDetail
    ? `${equipmentDetail.brand} ${equipmentDetail.model}`
    : "로딩 중..."

  return (
    <div>
      <DefaultPageHeader
        title="물품 대여"
        routes={[
          { display: <DefaultHomeIcon />, href: ROUTES.HOME },
          { display: "예약" },
          { display: "물품 대여", href: ROUTES.RESERVATION.EQUIPMENT },
          { display: equipmentLabel }
        ]}
      />

      {/* Selected equipment header */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-lg font-semibold">선택된 물품</span>
        <Link
          href={ROUTES.RESERVATION.EQUIPMENT}
          className="text-sm text-muted-foreground hover:underline"
        >
          다른 장비 선택
        </Link>
      </div>

      {/* PC layout */}
      <div className="hidden w-full min-h-[739px] gap-5 md:flex">
        <div className="w-1/4">
          <MyReservationField
            rentals={rentalList}
            onRentalClick={setSelectedRental}
          />
        </div>
        <div className="w-3/4">
          <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
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
                equipments={equipmentForSchedule}
              />
            </TabsContent>
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
                equipments={equipmentForSchedule}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="relative mx-auto max-w-[400px] md:hidden">
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

        {/* Mobile tabs */}
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
