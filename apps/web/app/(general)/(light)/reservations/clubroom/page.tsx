import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import dayjs from "dayjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ROUTES from "@/constants/routes"
import MyReservationField from "../_components/MyReservationField"
import WeekColumn from "../_components/WeekCalendarField/WeekColumn"
import { ChevronLeft, ChevronRight } from "lucide-react"
import AddScheduleButton from "../_components/WeekCalendarField/AddScheduleButton"

const ReservationPage = () => {
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
              <div className="w-full mt-7 flex bg-white">
                <div className="w-7 flex flex-col">
                  {Array.from({ length: 16 }).map((_, i) => {
                    const hour = (i + 6) % 12 === 0 ? 12 : (i + 6) % 12
                    const isPM = i + 6 >= 12

                    return (
                      <div
                        key={i}
                        className="text-[8px] w-full h-[42px] text-center first:text-[0px] text-gray-400"
                      >
                        {hour}
                        {isPM ? "PM" : "AM"}
                      </div>
                    )
                  })}
                </div>
                <div className="flex-1 flex">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <WeekColumn key={i} />
                  ))}
                </div>
              </div>
              <div className="absolute flex gap-5 items-center text-gray-700 font-semibold text-xl right-1/2 translate-x-1/2 -top-[62px]">
                <ChevronLeft />
                Jan 06-12, 2025
                <ChevronRight />
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
