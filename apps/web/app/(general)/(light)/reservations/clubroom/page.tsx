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
import { useState } from "react"
import isoWeek from "dayjs/plugin/isoWeek"
dayjs.extend(isoWeek)

const ReservationPage = () => {
  const getMonday = (date = dayjs()) => date.startOf("isoWeek") // 월요일 반환
  const [currentMonday, setCurrentMonday] = useState(getMonday())
  const weekLabel = `${currentMonday.format("MMM DD")}–${currentMonday.add(6, "day").format("DD, YYYY")}`

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
                <span>{weekLabel}</span>
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
