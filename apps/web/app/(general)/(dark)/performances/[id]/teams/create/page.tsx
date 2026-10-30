import Link from "next/link"

import TeamFormBackground from "@/app/(general)/(dark)/performances/[id]/teams/_components/TeamForm/Background"
import AuthGate from "@/components/AuthGate"
import OleoPageHeader from "@/components/PageHeaders/OleoPageHeader"
import ROUTES from "@/constants/routes"
import { mapPerformance } from "@/hooks/api/mapper"
import { apiClient } from "@/lib/apiClient"
import { getServerUser } from "@/lib/auth/server"
import {
  getPerformanceStage,
  isPerformanceRecruiting,
  PERFORMANCE_STAGE_LABEL
} from "@repo/shared-types"
import { josa } from "es-hangul"

import TeamForm from "../_components/TeamForm"

interface TeamCreatePageProps {
  params: Promise<{
    id: number
  }>
}

const TeamCreatePage = async (props: TeamCreatePageProps) => {
  const params = await props.params
  const performanceId = params.id

  const user = await getServerUser()

  // 조회 실패 시에는 폼을 그대로 보여주고 판단을 서버(팀 생성 API)에 맡김.
  // apiClient 응답의 날짜는 문자열이라 mapper로 Date 변환 후 판정
  const performance = await apiClient
    .getPerformanceById(Number(performanceId))
    .then(mapPerformance)
    .catch(() => null)
  const isClosed = performance !== null && !isPerformanceRecruiting(performance)

  const content = (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <TeamFormBackground />

      <OleoPageHeader
        title="Create New Team"
        goBackHref={ROUTES.PERFORMANCE.TEAM.LIST(performanceId)}
      />

      {isClosed ? (
        <div className="mb-20 flex w-full flex-col items-center gap-4 rounded-2xl bg-white px-7 py-16 text-center shadow-2xl md:p-20">
          <p className="text-lg font-semibold">팀 모집 기간이 아닙니다.</p>
          <p className="text-sm text-muted-foreground">
            {josa(performance.name, "은/는")} 지금{" "}
            {PERFORMANCE_STAGE_LABEL[getPerformanceStage(performance)]} 단계라
            새 팀을 만들 수 없습니다.
          </p>
          <Link
            href={ROUTES.PERFORMANCE.TEAM.LIST(performanceId)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            팀 목록으로
          </Link>
        </div>
      ) : (
        <TeamForm
          defaultPerformanceId={Number(performanceId)}
          closeHref={ROUTES.PERFORMANCE.TEAM.LIST(performanceId)}
          className="w-full bg-white px-7 py-10 md:p-20"
        />
      )}
    </div>
  )

  return user ? content : <AuthGate>{content}</AuthGate>
}

export default TeamCreatePage
