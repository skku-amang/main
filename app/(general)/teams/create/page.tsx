import Link from "next/link"
import { redirect } from "next/navigation"
import { RiArrowGoBackLine } from "react-icons/ri"

import TeamForm from "@/app/(general)/teams/_components/TeamForm"
import { auth } from "@/auth"
import OleoPageHeader from "@/components/OleoPageHeader"
import ROUTES from "@/constants/routes"

const TeamCreatePage = async () => {
  const session = await auth()
  if (!session) redirect(ROUTES.LOGIN.url)

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      <div className="z-10 mt-20 flex w-2/3 items-center justify-between">
        <Link
          href={ROUTES.TEAM.LIST.url}
          className="mt-2 flex items-center gap-x-5 font-semibold text-white"
        >
          <RiArrowGoBackLine className="text-white" />
          뒤로가기
        </Link>
        <OleoPageHeader
          inputSentence="Create New Team"
          textSize="text-[7rem]"
        />
        <div className="h-10 w-10 " />
      </div>
      <TeamForm className="z-10 w-2/3 bg-white" />
      <div className="absolute top-0 z-0 h-80 w-full bg-primary"></div>
    </div>
  )
}

export default TeamCreatePage
