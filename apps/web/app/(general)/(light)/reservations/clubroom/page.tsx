import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ROUTES from "@/constants/routes"
import MyReservationField from "../_components/MyReservationField"

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
            <TabsContent value="week">
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

                <div className="flex-1 flex flex-col">
                  <div className="w-[14.28%] border-x-[1.5px] border-gray-100">
                    <div className="w-full bg-gray-50 h-[42px] border-t-[1.5px] border-gray-100 text-xs text-black font-medium flex justify-center items-center">
                      Sun 6
                    </div>
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-[42px] border-t-[1.5px] last:border-b-[1.5px] border-gray-100"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="month">Change your password here.</TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default ReservationPage
