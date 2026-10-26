"use client"

import { useParams } from "next/navigation"
import Link from "next/link"

import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import ROUTES from "@/constants/routes"
import { useEquipment } from "@/hooks/api/useEquipment"
import ReservationCalendar from "../../../_components/ReservationCalendar"

export default function EquipmentCalendarPage() {
  const params = useParams()
  const equipmentId = Number(params.id)
  const { data: equipmentDetail } = useEquipment(equipmentId)

  const equipmentLabel = equipmentDetail
    ? `${equipmentDetail.brand} ${equipmentDetail.model}`
    : "로딩 중..."

  return (
    <ReservationCalendar
      filter={{ equipmentId }}
      equipments={equipmentDetail ? [equipmentDetail] : []}
      header={
        <>
          <DefaultPageHeader
            title="장비 대여"
            routes={[
              { display: <DefaultHomeIcon />, href: ROUTES.HOME },
              { display: "예약" },
              { display: "장비 대여", href: ROUTES.RESERVATION.EQUIPMENT },
              { display: equipmentLabel }
            ]}
          />

          {/* Selected equipment header (desktop only) */}
          <div className="mb-4 hidden items-center gap-3 md:flex">
            <span className="text-lg font-semibold">{equipmentLabel}</span>
            <Link
              href={ROUTES.RESERVATION.EQUIPMENT}
              className="text-sm text-muted-foreground hover:underline"
            >
              다른 장비 선택
            </Link>
          </div>
        </>
      }
    />
  )
}
