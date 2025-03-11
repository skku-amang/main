import { StatusCodes } from "http-status-codes"
import Link from "next/link"
import { redirect } from "next/navigation"
import { RiArrowGoBackLine } from "react-icons/ri"

import ErrorPage from "@/app/_(errors)/Error"
import NotFoundPage from "@/app/_(errors)/NotFound"
import { auth } from "@/auth"
import OleoPageHeader from "@/components/PageHeaders/OleoPageHeader"
import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import ROUTES from "@/constants/routes"
import fetchData from "@/lib/fetch"

import TeamForm from "../../../../../../(light)/performances/[id]/teams/_components/TeamForm"

interface TeamEditPageProps {
  params: Promise<{
    id: number
    teamId: number
  }>
}

const TeamEditPage = async (props: TeamEditPageProps) => {
  const params = await props.params
  const performanceId = params.id
  const id = params.teamId

  const session = await auth()
  if (!session) redirect(ROUTES.LOGIN)

  const res = await fetchData(API_ENDPOINTS.TEAM.RETRIEVE(id) as ApiEndpoint, {
    cache: "no-cache",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${session.access}`
    }
  })

  if (!res.ok) {
    switch (res.status) {
      case StatusCodes.NOT_FOUND:
        return <NotFoundPage />
      default:
        return <ErrorPage />
    }
  }

  const data = (await res.json()) as any

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {/* 프라미어리 배경 */}
      <div className="absolute top-0 z-[-1] h-[325px] w-full bg-primary" />

      {/* 헤더 */}
      <div className="flex w-full items-center justify-between">
        {/* 뒤로가기 버튼 */}
        <Link
          href={ROUTES.PERFORMANCE.TEAM.LIST(performanceId)}
          className="mt-2 flex items-center gap-x-5 font-semibold text-white"
        >
          <RiArrowGoBackLine className="text-white" />
          뒤로가기
        </Link>

        {/* 페이지 제목 */}
        <OleoPageHeader title="Create Your Team" />

        <div />
      </div>

      {/* 양식 */}
      <TeamForm
        initialData={data}
        className="w-full bg-white px-7 py-10 md:p-20"
      />
    </div>
  )
}

export default TeamEditPage
