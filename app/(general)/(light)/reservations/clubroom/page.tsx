import { Home } from "lucide-react"

import Calendar from "@/app/(general)/(light)/reservations/_components/Calender"
import { AddScheduleButton } from "@/app/(general)/(light)/reservations/_components/Calender/AddScheduleButton"
import ReservationStatus from "@/app/(general)/(light)/reservations/_components/ReservationStatus"
import DefaultPageHeader from "@/components/PageHeaders/Default"
import ROUTES from "@/constants/routes"

const ReservationPage = () => {
  return (
    <div>
      <DefaultPageHeader
        title="동아리방 예약"
        routes={[
          { display: <Home />, href: ROUTES.HOME },
          { display: "예약" },
          { display: "동아리방 예약" }
        ]}
      />
      <div className="relative flex w-full justify-center">
        <ReservationStatus />
        <div className="ml-8 h-auto w-[1000px]">
          <Calendar />
        </div>
        <AddScheduleButton className=" absolute right-5 top-2 h-9 rounded-md bg-primary px-4 py-2 text-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      </div>
    </div>
  )
}

export default ReservationPage
