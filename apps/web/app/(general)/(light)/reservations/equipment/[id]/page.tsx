"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import dayjs from "dayjs"
import isoWeek from "dayjs/plugin/isoWeek"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import ROUTES from "@/constants/routes"
import { useEquipment } from "@/hooks/api/useEquipment"
import { useRentals } from "@/hooks/api/useRental"
import MyReservationField from "../../_components/MyReservationField"
import AddScheduleButton from "../../_components/AddScheduleButton"
import WeekCalendarField from "../../_components/WeekCalendarField"
import WeekLabel from "../../_components/WeekLable"
import MonthCalendarField from "../../_components/MonthCalendarField"
import MobileCalendarField from "../../_components/MobileCalendarField"

dayjs.extend(isoWeek)

export default function EquipmentCalendarPage() {
  const params = useParams()
  const equipmentId = Number(params.id)
  const { data: equipmentDetail } = useEquipment(equipmentId)

  const getMonday = (date = dayjs()) => date.startOf("isoWeek")
  const [currentMonday, setCurrentMonday] = useState(getMonday())
  const [calendarViewMonth, setCalendarViewMonth] = useState(currentMonday)

  useEffect(() => {
    setCalendarViewMonth(currentMonday)
  }, [currentMonday])

  const queryRange = useMemo(() => {
    const monthStart = calendarViewMonth
      .startOf("month")
      .startOf("isoWeek")
      .toDate()
    const monthEnd = calendarViewMonth.endOf("month").endOf("isoWeek").toDate()
    return { from: monthStart, to: monthEnd }
  }, [calendarViewMonth])

  const { data: rentals } = useRentals({
    equipmentId,
    ...queryRange
  })

  const weekLabel = `${currentMonday.format("MMM DD")}–${currentMonday.add(6, "day").format("DD, YYYY")}`
  const monthLabel = calendarViewMonth.format("MMMM YYYY")
  const calendarStart = calendarViewMonth.startOf("month").startOf("isoWeek")
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
          <MyReservationField rentals={rentalList} />
        </div>
        <div className="w-3/4">
          <Tabs defaultValue="week">
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
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
      <div className="relative mx-auto max-w-[400px] pt-6 md:hidden">
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
          className="top-12 flex w-full justify-between px-5"
        />
      </div>
    </div>
  )
}
