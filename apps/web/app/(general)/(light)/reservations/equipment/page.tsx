import type { Metadata } from "next"

import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import ROUTES from "@/constants/routes"

export const metadata: Metadata = {
  title: "물품 대여",
  description: "AMANG 동아리 물품 대여 신청",
  alternates: { canonical: "/reservations/equipment" }
}

const ReservationPage = () => {
  return (
    <div>
      <DefaultPageHeader
        title="물품 대여"
        routes={[
          {
            display: <DefaultHomeIcon />,
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
    </div>
  )
}

export default ReservationPage
