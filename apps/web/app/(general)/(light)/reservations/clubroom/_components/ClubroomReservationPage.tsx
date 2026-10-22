"use client"
import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import dayjs from "dayjs"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import ViewTabsList from "../../_components/ViewTabsList"
import ROUTES from "@/constants/routes"
import MyReservationField from "../../_components/MyReservationField"
import AddScheduleButton from "../../_components/AddScheduleButton"
import WeekCalendarField from "../../_components/WeekCalendarField"
import { useCallback, useMemo, useState } from "react"
import { useQueryState, parseAsStringLiteral, parseAsString } from "nuqs"
import WeekLabel from "../../_components/WeekLable"
import MonthCalendarField from "../../_components/MonthCalendarField"
import MobileCalendarField from "../../_components/MobileCalendarField"
import MobileTimeSlots from "../../_components/MobileCalendarField/MobileTimeSlots"
import MobileMyReservations from "../../_components/MobileCalendarField/MobileMyReservations"
import { useRentals } from "@/hooks/api/useRental"
import { useEquipments } from "@/hooks/api/useEquipment"
import { RentalDetail } from "@repo/shared-types"
import RentalDetailModal from "../../_components/RentalDetailModal"
import PeriodPager from "../../_components/PeriodPager"
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
  // 값이 없으면 오늘 — withDefault에 dayjs() 같은 동적 값은 hydration 불일치라 대신 null로 표현
  const [selectedDateStr, setSelectedDateStr] = useQueryState(
    "date",
    parseAsString
  )
  const selectedDate = (() => {
    if (!selectedDateStr) return dayjs().startOf("day")
    const [y, m, d] = selectedDateStr.split("-").map(Number)
    return dayjs(new Date(y!, m! - 1, d!))
  })()
  const setSelectedDate = useCallback(
    (date: Dayjs) =>
      setSelectedDateStr(
        date.isSame(dayjs(), "day") ? null : date.format("YYYY-MM-DD")
      ),
    [setSelectedDateStr]
  )

  // Google Calendar 방식: selectedDate에서 주/월 범위 파생
  const currentMonday = selectedDate.startOf("week")
  const calendarViewMonth = selectedDate.startOf("month")

  // WeekLabel 네비게이션용 래퍼
  const setCurrentMonday = (mondayOrFn: Dayjs | ((prev: Dayjs) => Dayjs)) => {
    const newMonday =
      typeof mondayOrFn === "function" ? mondayOrFn(currentMonday) : mondayOrFn
    // 이동한 주·달에 오늘이 있으면 오늘을 선택 — 첫날 대신 오늘이 보이고 주소의 date도 빠짐
    setSelectedDate(
      newMonday.isSame(dayjs(), "week") ? dayjs().startOf("day") : newMonday
    )
  }
  const setCalendarViewMonth = (
    monthOrFn: Dayjs | ((prev: Dayjs) => Dayjs)
  ) => {
    const newMonth =
      typeof monthOrFn === "function" ? monthOrFn(calendarViewMonth) : monthOrFn
    setSelectedDate(
      newMonth.isSame(dayjs(), "month") ? dayjs().startOf("day") : newMonth
    )
  }

  // 달마다 따로 조회해 캐시를 재사용 — 넘겨도 새로 받는 건 새로 보이는 달 하나뿐.
  // 넘김 화면에 옆 기간도 그려야 해서 이전·현재·다음 달을 함께 씀
  const monthQuery = (month: Dayjs) => ({
    type: "room" as const,
    from: month.startOf("month").startOf("week").toDate(),
    to: month.endOf("month").endOf("week").toDate()
  })
  const { data: prevMonthRentals } = useRentals(
    monthQuery(calendarViewMonth.subtract(1, "month"))
  )
  const { data: monthRentals } = useRentals(monthQuery(calendarViewMonth))
  const { data: nextMonthRentals } = useRentals(
    monthQuery(calendarViewMonth.add(1, "month"))
  )
  // ±2달은 미리 받아 두기만 — 넘겨서 달이 바뀐 직후 새 달을 받느라 달력을 한 번 더 그리지 않게
  useRentals(monthQuery(calendarViewMonth.subtract(2, "month")))
  useRentals(monthQuery(calendarViewMonth.add(2, "month")))
  const { data: equipments } = useEquipments("room")

  const weekLabel = `${currentMonday.format("MMM DD")}–${currentMonday.add(6, "day").format("DD, YYYY")}`
  const monthLabel = calendarViewMonth.format("MMMM, YYYY")
  const calendarStart = calendarViewMonth.startOf("month").startOf("week")
  const daysInCalendar = Array.from({ length: 42 }, (_, i) =>
    calendarStart.add(i, "day")
  )

  // 달 경계 주는 양쪽 조회에 다 들어 있어 id로 중복 제거
  const rentalList = useMemo(() => {
    const byId = new Map<number, RentalDetail>()
    for (const r of [
      ...(prevMonthRentals ?? []),
      ...(monthRentals ?? []),
      ...(nextMonthRentals ?? [])
    ])
      byId.set(r.id, r)
    return [...byId.values()]
  }, [prevMonthRentals, monthRentals, nextMonthRentals])
  const equipmentList = equipments ?? []

  return (
    <div className="bg-neutral-50 -mx-4 px-4 md:-mx-0 md:px-0">
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
            <ViewTabsList />
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
                calendarViewMonth={calendarViewMonth}
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
      <div className="relative md:hidden">
        {/* 주/월 공용 달력 카드 — 전환 버튼과 ‹ 날짜 › 줄 위치를 두 보기가 같이 씀 */}
        <div className="relative bg-white">
          <Tabs
            value={view}
            onValueChange={(v) => setView(v as typeof view)}
            className="absolute right-4 top-1 z-10"
          >
            <ViewTabsList />
          </Tabs>
          <PeriodPager
            onPrev={() =>
              view === "week"
                ? setCurrentMonday((prev) => prev.subtract(1, "week"))
                : setCalendarViewMonth((prev) => prev.subtract(1, "month"))
            }
            onNext={() =>
              view === "week"
                ? setCurrentMonday((prev) => prev.add(1, "week"))
                : setCalendarViewMonth((prev) => prev.add(1, "month"))
            }
            panelKey={(offset) =>
              view === "week"
                ? currentMonday.add(offset, "week").format("YYYY-MM-DD")
                : calendarViewMonth.add(offset, "month").format("YYYY-MM")
            }
            renderPanel={(offset) =>
              view === "week" ? (
                <div className="px-2 pb-20 pt-[88px]">
                  <WeekCalendarField
                    currentMonday={currentMonday.add(offset, "week")}
                    rentals={rentalList}
                    onRentalClick={setSelectedRental}
                    compact
                  />
                </div>
              ) : (
                <MobileCalendarField
                  calendarViewMonth={calendarViewMonth.add(offset, "month")}
                  rentals={rentalList}
                  onDateSelect={setSelectedDate}
                  selectedDate={selectedDate}
                />
              )
            }
          />
          <WeekLabel
            weekLabel={weekLabel}
            setCalendarViewMonth={setCalendarViewMonth}
            setCurrentMonday={setCurrentMonday}
            currentMonday={currentMonday}
            calendarViewMonth={calendarViewMonth}
            monthLabel={monthLabel}
            daysInCalendar={daysInCalendar}
            mode={view}
            className="top-12 flex w-full justify-between px-5"
          />
        </div>

        {view === "month" && (
          <>
            {/* Mobile tab buttons (pill style matching Figma) */}
            <div className="flex gap-2 px-4 py-4">
              <button
                className={`flex-1 rounded-[10px] h-[45px] text-base font-semibold transition-colors ${
                  mobileTab === "schedule"
                    ? "bg-third text-white"
                    : "bg-white text-gray-400"
                }`}
                onClick={() => setMobileTab("schedule")}
              >
                예약 현황
              </button>
              <button
                className={`flex-1 rounded-[10px] h-[45px] text-base font-semibold transition-colors ${
                  mobileTab === "my"
                    ? "bg-third text-white"
                    : "bg-white text-gray-400"
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
          </>
        )}

        <AddScheduleButton
          className="fixed bottom-[calc(var(--tabbar-height)+1rem)] left-4 right-4 z-50 shadow-lg"
          floating
          equipments={equipmentList}
          label="예약하기"
        />
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
