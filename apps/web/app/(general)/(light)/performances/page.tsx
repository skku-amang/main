import type { Metadata } from "next"

import PerformanceListClient from "./_components/PerformanceListClient"

export const metadata: Metadata = {
  title: "공연 목록",
  description:
    "AMANG 역대 공연 아카이브. 공연 정보와 밴드 팀 목록을 확인하세요.",
  alternates: { canonical: "/performances" }
}

export default function PerformancesPage() {
  return <PerformanceListClient />
}
