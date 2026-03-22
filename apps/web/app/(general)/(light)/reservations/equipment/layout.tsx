import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "물품 대여",
  description: "AMANG 동아리 물품 대여 신청",
  alternates: { canonical: "/reservations/equipment" }
}

export default function EquipmentLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children
}
