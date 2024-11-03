import { StatusCodes } from "http-status-codes"
import Link from "next/link"
import { redirect } from "next/navigation"
import { RiArrowGoBackLine } from "react-icons/ri"

import ErrorPage from "@/app/_(errors)/Error"
import NotFoundPage from "@/app/_(errors)/NotFound"
import { auth } from "@/auth"
import OleoPageHeader from "@/components/OleoPageHeader"
import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import ROUTES from "@/constants/routes"
import fetchData from "@/lib/fetch"

import TeamForm from "../../_components/TeamForm"

interface TeamEditPageProps {
  params: {
    id: number
    teamId: number
  }
}

const TeamEditPage = async ({ params }: TeamEditPageProps) => {
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
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      {/* 헤더 */}
      <div className="z-10 mt-20 flex w-2/3 items-center justify-between">
        <Link
          href={ROUTES.PERFORMANCE.TEAM.DETAIL(performanceId, id)}
          className="mt-2 flex items-center gap-x-5 font-semibold text-white"
        >
          <RiArrowGoBackLine className="text-white" />
          뒤로가기
        </Link>
        <OleoPageHeader title="Create Your Team" />
        <div className="h-10 w-10 " />
      </div>

      {/* 양식 */}
      <TeamForm initialData={data} className="z-10 w-2/3 bg-white" />

      <div className="absolute top-0 z-0 h-80 w-full bg-primary"></div>
    </div>
  )
}

export default TeamEditPage
