import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "동아리방 예약",
  description: "AMANG 동아리방 예약 캘린더",
  alternates: { canonical: "/reservations/clubroom" }
}

export default function ClubroomLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children
}
