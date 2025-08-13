"use client"
import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import dayjs from "dayjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ROUTES from "@/constants/routes"
import MyReservationField from "../_components/MyReservationField"
import AddScheduleButton from "../_components/WeekCalendarField/AddScheduleButton"
import WeekCalendarField from "../_components/WeekCalendarField"
import { useEffect, useState } from "react"
import isoWeek from "dayjs/plugin/isoWeek"
import WeekLabel from "../_components/WeekLable"
import MonthCalendarField from "../_components/MonthCalendarField"
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
            <TabsContent value="month" className="relative">
              <MonthCalendarField />
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
    </div>
  )
}

export default ReservationPage
