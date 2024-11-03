import Link from "next/link"
import { redirect } from "next/navigation"
import { RiArrowGoBackLine } from "react-icons/ri"

import TeamForm from "@/app/(general)/teams/_components/TeamForm"
import { auth } from "@/auth"
import OleoPageHeader from "@/components/OleoPageHeader"
import ROUTES from "@/constants/routes"

const TeamCreatePage = async () => {
  const session = await auth()
  if (!session) redirect(ROUTES.LOGIN)

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      {/* 헤더 */}
      <div className="z-10 mt-20 flex w-2/3 items-center justify-between">
        {/* 뒤로가기 버튼 */}
        <Link
          href={ROUTES.PERFORMANCE.TEAM.LIST(1)}  // TODO: 공연 ID 동적으로 받기
          className="mt-2 flex items-center gap-x-5 font-semibold text-white"
        >
          <RiArrowGoBackLine className="text-white" />
          뒤로가기
        </Link>
        
        {/* 페이지 제목 */}
        <OleoPageHeader title="Create Your Team" />

        <div className="h-10 w-10 " />
      </div>

      {/* 양식 */}
      <TeamForm className="z-10 w-2/3 bg-white" />

      <div className="absolute top-0 z-0 h-80 w-full bg-primary"></div>
    </div>
  )
}

export default TeamCreatePage
