"use client"

import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import ROUTES from "@/constants/routes"
import { useEquipments } from "@/hooks/api/useEquipment"
import ReservationCalendar from "../../_components/ReservationCalendar"

export default function ClubroomReservationPage() {
  const { data: equipments } = useEquipments("room")

  return (
    <ReservationCalendar
      filter={{ type: "room" }}
      equipments={equipments ?? []}
      header={
        <DefaultPageHeader
          title="동아리방 예약"
          routes={[
            { display: <DefaultHomeIcon />, href: ROUTES.HOME },
            { display: "예약" },
            { display: "동아리방 예약" }
          ]}
        />
      }
    />
  )
}
