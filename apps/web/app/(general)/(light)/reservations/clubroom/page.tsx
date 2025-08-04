"use client"
import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import dayjs from "dayjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ROUTES from "@/constants/routes"
import MyReservationField from "../_components/MyReservationField"
import { ChevronLeft, ChevronRight } from "lucide-react"
import AddScheduleButton from "../_components/WeekCalendarField/AddScheduleButton"
import WeekCalendarField from "../_components/WeekCalendarField"
import { useEffect, useState } from "react"
import isoWeek from "dayjs/plugin/isoWeek"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
dayjs.extend(isoWeek)

const ReservationPage = () => {
  const getMonday = (date = dayjs()) => date.startOf("isoWeek")
  const [currentMonday, setCurrentMonday] = useState(getMonday())
  const [calendarViewMonth, setCalendarViewMonth] = useState(currentMonday)

  useEffect(() => {
    setCalendarViewMonth(currentMonday)
  }, [currentMonday])

  const weekLabel = `${currentMonday.format("MMM DD")}–${currentMonday.add(6, "day").format("DD, YYYY")}`
  const calendarStart = calendarViewMonth.startOf("month").startOf("isoWeek")
  const daysInCalendar = Array.from({ length: 42 }, (_, i) =>
    calendarStart.add(i, "day")
  )
  const monthLabel = calendarViewMonth.format("MMMM YYYY")
  const dayList = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

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
      <div className="w-full min-h-[739px] flex gap-5">
        <div className="w-1/4">
          <MyReservationField />
        </div>
        <div className="w-3/4">
          <Tabs defaultValue="week">
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
            <TabsContent className="relative" value="week">
              <WeekCalendarField currentMonday={currentMonday} />
              <div className="absolute flex gap-5 items-center text-gray-700 font-semibold text-xl right-1/2 translate-x-1/2 -top-[62px]">
                <ChevronLeft
                  className="cursor-pointer"
                  onClick={() =>
                    setCurrentMonday((prev) => prev.subtract(1, "week"))
                  }
                />
                <DropdownMenu>
                  <DropdownMenuTrigger>{weekLabel}</DropdownMenuTrigger>
                  <DropdownMenuContent className="mt-3 border-zinc-200 shadow-sm border-[1.5px] w-[300px]">
                    <DropdownMenuLabel>
                      <div className="w-full items-center text-zinc-950 font-medium text-sm flex justify-between">
                        {/* 왼쪽 화살표: 전달로 이동 */}
                        <div
                          onClick={() =>
                            setCalendarViewMonth((prev) =>
                              prev.subtract(1, "month")
                            )
                          }
                          className="flex justify-center items-center size-7 rounded-sm border-[1px] border-zinc-200 cursor-pointer hover:bg-zinc-100"
                        >
                          <ChevronLeft size={16} />
                        </div>

                        <span>{monthLabel}</span>

                        {/* 오른쪽 화살표: 다음달로 이동 */}
                        <div
                          onClick={() =>
                            setCalendarViewMonth((prev) => prev.add(1, "month"))
                          }
                          className="flex justify-center items-center size-7 rounded-sm border-[1px] border-zinc-200 cursor-pointer hover:bg-zinc-100"
                        >
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuItem className="p-0 px-2">
                      <div className="w-full pt-3 grid grid-cols-7">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div
                            className="w-1/7 h-7 text-zinc-500 text-[12.8px] flex justify-center transition-colors rounded-sm items-center"
                            key={dayList[i]}
                          >
                            {dayList[i]}
                          </div>
                        ))}
                        {daysInCalendar.map((date, i) => {
                          const isCurrentMonth =
                            date.month() === calendarViewMonth.month()
                          return (
                            <div
                              key={i}
                              onClick={() =>
                                setCurrentMonday(date.startOf("isoWeek"))
                              }
                              className={`h-9 text-sm flex justify-center items-center rounded-sm cursor-pointer duration-150 transition-colors
    ${isCurrentMonth ? "text-zinc-950" : "text-zinc-300"}
    hover:bg-sky-50`}
                            >
                              {date.date()}
                            </div>
                          )
                        })}
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <ChevronRight
                  className="cursor-pointer"
                  onClick={() =>
                    setCurrentMonday((prev) => prev.add(1, "week"))
                  }
                />
              </div>
              <AddScheduleButton className="absolute -top-[62px] right-0" />
            </TabsContent>
            <TabsContent value="month">Change your password here.</TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default ReservationPage
