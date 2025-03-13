import { Home } from "lucide-react"

import Calendar from "@/app/(general)/(light)/reservations/_components/Calendar"
import ReservationStatus from "@/app/(general)/(light)/reservations/_components/ReservationStatus"
import DefaultPageHeader from "@/components/PageHeaders/Default"
import ROUTES from "@/constants/routes"

const ReservationPage = () => {
  return (
    <div>
      <DefaultPageHeader
        title="동아리방 예약"
        routes={[
          {
            display: <Home />,
            href: ROUTES.HOME
          },
          {
            display: "예약"
          },
          {
            display: "동아리방 예약"
          }
        ]}
      />
      <div className="flex w-full justify-center">
        <ReservationStatus />

        <div className="ml-8 h-[730px] w-[850px]">
          <Calendar />
        </div>
      </div>
    </div>
  )
}

export default ReservationPage
