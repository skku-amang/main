import { Home } from "lucide-react"

import ReservationStatus from "@/app/(general)/(light)/reservations/_components/ReservationStatus"
import DefaultPageHeader from "@/components/PageHeaders/Default"
import ROUTES from "@/constants/routes"

const ReservationPage = () => {
  return (
    <div>
      <DefaultPageHeader
        title="물품 대여"
        routes={[
          {
            display: <Home />,
            href: ROUTES.HOME
          },
          {
            display: "예약"
          },
          {
            display: "물품 대여"
          }
        ]}
      />

      <ReservationStatus />
    </div>
  )
}

export default ReservationPage
