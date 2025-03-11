import Link from "next/link"
import { redirect } from "next/navigation"
import { RiArrowGoBackLine } from "react-icons/ri"

import { auth } from "@/auth"
import OleoPageHeader from "@/components/PageHeaders/OleoPageHeader"
import ROUTES from "@/constants/routes"

import TeamForm from "../../../../../(light)/performances/[id]/teams/_components/TeamForm"

interface TeamCreatePageProps {
  params: Promise<{
    id: number
  }>
}

const TeamCreatePage = async (props: TeamCreatePageProps) => {
  const params = await props.params
  const performanceId = params.id

  const session = await auth()
  if (!session) redirect(ROUTES.LOGIN)

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
      <TeamForm className="w-full bg-white px-7 py-10 md:p-20" />
    </div>
  )
}

export default TeamCreatePage
