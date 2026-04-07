import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "장비 대여",
  description: "AMANG 동아리 장비 대여 신청",
  alternates: { canonical: "/reservations/equipment" }
}

export default function EquipmentLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children
}
