import type { Metadata } from "next"

import ClubroomReservationClient from "./_components/ClubroomReservationClient"

export const metadata: Metadata = {
  title: "동아리방 예약",
  description: "AMANG 동아리방 예약 캘린더",
  alternates: { canonical: "/reservations/clubroom" }
}

export default function ClubroomReservationPage() {
  return <ClubroomReservationClient />
}
