"use client"

import { Separator } from "@radix-ui/react-separator"
import { StatusCodes } from "http-status-codes"
import { ChevronRight, Maximize2 } from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

import ApplyButton from "@/app/(general)/(dark)/performances/[id]/teams/[teamId]/_components/ApplyButton"
import BasicInfo from "@/app/(general)/(dark)/performances/[id]/teams/[teamId]/_components/BasicInfo"
import DeleteEditButton from "@/app/(general)/(dark)/performances/[id]/teams/[teamId]/_components/DeleteEditButton"
import MemberSessionCard from "@/app/(general)/(dark)/performances/[id]/teams/[teamId]/_components/MemberSessionCard"
import SessionSetCard from "@/app/(general)/(dark)/performances/[id]/teams/[teamId]/_components/SessionSetCard"
import Loading from "@/app/_(errors)/Loading"
import NotFoundPage from "@/app/_(errors)/NotFound"
import { useToast } from "@/components/hooks/use-toast"
import OleoPageHeader from "@/components/PageHeaders/OleoPageHeader"
import SessionBadge from "@/components/TeamBadges/SessionBadge"
import { Button } from "@/components/ui/button"
import ROUTES from "@/constants/routes"
import { useTeam } from "@/hooks/api/useTeam"
import YoutubePlayer from "@/lib/youtube/Player"
import { MemberSessionSet, SessionOrder, Team } from "shared-types"

interface TeamDetailProps {
  params: {
    id: number
    teamId: number
  }
}

const TeamDetail = (props: TeamDetailProps) => {
  const session = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const performanceId = props.params.id
  const id = props.params.teamId

  const { data: team, isLoading, isError } = useTeam(id)

  const [selectedSessionsWithIndex, setSelectedSessionsWithIndex] = useState<
    string[]
  >([])
  function toggleSelectedSessionWithIndex(sessionWithIndex: string) {
    setSelectedSessionsWithIndex((prev) => {
      if (prev.includes(sessionWithIndex)) {
        return prev.filter(
          (selectedSessionWithIndex) =>
            selectedSessionWithIndex !== sessionWithIndex
        )
      } else {
        return [...prev, sessionWithIndex]
      }
    })
  }

  async function onApply() {
    if (selectedSessionsWithIndex.length === 0) {
      toast({
        title: "세션 지원 실패",
        description: "적어도 하나의 세션을 선택해야 합니다",
        variant: "destructive"
      })
      return
    }

    const res = await fetchData(API_ENDPOINTS.TEAM.APPLY(id) as ApiEndpoint, {
      body: JSON.stringify({
        applications: selectedSessionsWithIndex.map(
          (selectedSessionWithIndex) => {
            const [session, index] = selectedSessionWithIndex.split("__")
            return { session, index: +index - 1 }
          }
        )
      }),
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${session.data?.access}`,
        "Content-Type": "application/json"
      }
    })

    if (!res.ok) {
      switch (res.status) {
        case StatusCodes.BAD_REQUEST:
          toast({
            title: "세션 지원 실패",
            description: (await res.json())?.detail || "알 수 없는 에러 발생",
            variant: "destructive"
          })
          break
        case StatusCodes.CONFLICT:
          toast({
            title: "세션 지원 실패",
            description: "이미 등록된 세션입니다.",
            variant: "destructive"
          })
          break
        default:
          toast({
            title: "세션 지원 실패",
            description: "알 수 없는 에러 발생",
            variant: "destructive"
          })
      }
      return
    }

    const data = (await res.json()) as Team
    toast({
      title: "지원 완료",
      description: "성공적으로 팀에 등록되었습니다!"
    })
    setTeam(data)
  }

  if (session.status === "unauthenticated") router.push(ROUTES.LOGIN)

  if (isLoading) {
    return <Loading />
  } else if (isError) {
    return <div>Error</div>
  } else if (!team) {
    return <NotFoundPage />
  }

  const memberSessionSet = new MemberSessionSet(team.memberSessions)
  const memberSessionsWithMissingMembers =
    memberSessionSet.getSessionsWithMissingMembers()
  const memberSessionsWithAtleastOneMember =
    memberSessionSet.getSessionsWithAtleastOneMember()

  return (
    <div className="container flex w-full flex-col items-center px-0 pt-16">
      {/* 기울어진 배경 - 슬레이트 */}
      <div
        className="absolute left-0 top-0 z-0 h-[283px] w-full bg-slate-300 md:h-[600px]"
        style={{ clipPath: "polygon(0 0%, 80% 0, 180% 65%, 0% 100%)" }}
      />

      {/* 기울어진 배경 - 프라이머리 */}
      <div
        className="absolute left-0 top-0 h-[283px] w-full bg-primary md:h-[600px]"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 60%, 0% 100%)" }}
      />

      {/* 페이지 헤더 */}
      <OleoPageHeader
        title="Join Your Team"
        goBackHref={ROUTES.PERFORMANCE.TEAM.LIST(performanceId)}
        className="relative mb-10"
      />

      {/* 유튜브 임베드 */}
      <div className="relative z-10 flex w-full items-center justify-center pb-[20px] md:pb-[49px]">
        {team.songYoutubeVideoUrl && (
          <YoutubePlayer
            videoUrl={team.songYoutubeVideoUrl}
            className="mx-10 aspect-video h-auto w-full md:h-[673px] md:w-[1152px]"
          />
        )}
      </div>

      {/*수정 및 삭제 (모바일)*/}
      {session.data &&
        (session.data.is_admin ||
          (session.data.id && +session.data.id === team.leader.id)) && (
          <div className="block h-auto w-[93%] justify-items-end pb-5  md:hidden  min-[878px]:w-11/12 lg:w-5/6">
            <DeleteEditButton
              performanceId={performanceId}
              team={team}
              accessToken={session.data?.access}
            />
          </div>
        )}

      <div className="flex w-full gap-[24px] max-md:flex-col max-md:items-center md:flex md:w-[1152px]">
        {/* 기본 정보 및 포스터*/}
        <div className="flex w-full flex-col gap-y-[24px]">
          <BasicInfo team={team} />
          <div className="hidden w-full overflow-clip md:block">
            {team.posterImage && (
              <Image
                className="rounded-lg"
                src={team.posterImage}
                alt="poster"
                fill
              />
            )}
            <div className="absolute bottom-[16px] right-[16px] flex h-11 w-11 animate-pulse items-center justify-center rounded-[10px] bg-gray-600/50 md:hidden">
              <Maximize2 className="text-white" />
            </div>
          </div>
        </div>

        {/* 세션 구성 */}
        <div className="flex h-full w-[93%] flex-col gap-y-5 md:w-[662px]">
          {/* 세션 구성 */}
          {team.memberSessions && (
            <SessionSetCard
              header="세션구성"
              className="h-fit bg-white shadow-md"
            >
              <div className="flex flex-wrap gap-x-2 gap-y-2 pt-[20px] md:pt-[40px]">
                {team.memberSessions
                  .sort((a, b) => {
                    return (
                      SessionOrder.indexOf(a.session) -
                      SessionOrder.indexOf(b.session)
                    )
                  })
                  .map((ms) =>
                    ms.members.map((_, index) => {
                      const sessionWithIndex = `${ms.session}${index + 1}`
                      return (
                        <SessionBadge
                          key={sessionWithIndex}
                          session={sessionWithIndex}
                          className="h-[22px] w-[56px] justify-center rounded bg-slate-200 px-[5px] py-[6px] text-xs hover:bg-slate-300 md:h-[34px] md:w-[74px] md:rounded-[20px] md:text-base"
                        />
                      )
                    })
                  )}
              </div>
            </SessionSetCard>
          )}

          {/* 마감된 세션 */}
          <SessionSetCard
            header="마감된 세션"
            className="col-span-2 bg-white shadow-md"
          >
            <div className="grid grid-cols-1">
              <div className="mt-4 hidden text-sm font-medium leading-normal text-slate-500 md:flex">
                <div className="flex h-[48px] w-[160px] items-center pl-4">
                  Session
                </div>
                <div className="flex h-[48px] w-[466px] items-center pl-4">
                  Member
                </div>
              </div>
              <Separator className="hidden h-[1.5px] w-full bg-slate-200 md:block" />
              {memberSessionsWithAtleastOneMember.map((ms) =>
                ms.members.map((member, index) => {
                  if (member) {
                    return (
                      <div
                        key={`${ms.session}-${index}`}
                        className="flex flex-col"
                      >
                        <MemberSessionCard
                          teamId={team.id}
                          session={ms.session}
                          sessionIndex={index + 1}
                          user={member}
                          onUnapplySuccess={setTeam}
                        />
                        <Separator className="h-[1.5px] w-full bg-slate-200" />
                      </div>
                    )
                  }
                })
              )}
            </div>
          </SessionSetCard>

          {/* 팀 참여 신청 */}
          <SessionSetCard
            header="세션 지원"
            className="col-span-2 bg-white shadow-md"
          >
            <ul className="mb-6 w-full pt-[12px] text-xs font-normal leading-normal text-gray-600 md:w-[537px] md:pt-[16px]">
              <li className="mb-1 md:mb-[10px]">
                ・아래 버튼을 눌러 해당 팀에 참여 신청을 할 수 있으며,
                선착순으로 마감됩니다
              </li>
              <li>
                ・아래 버튼을 다시 누르거나 마이페이지에 접속하여 신청을 취소할
                수 있습니다
              </li>
            </ul>

            {memberSessionsWithMissingMembers.length > 0 ? (
              <div>
                <div className="grid grid-cols-2 gap-x-[26px] gap-y-[26px]">
                  {memberSessionsWithMissingMembers.map((ms) =>
                    ms.members.map(
                      (member, index) =>
                        member === null && (
                          <ApplyButton
                            key={`${ms.session}-${index}`}
                            session={ms.session}
                            memberSessionIndex={index + 1}
                            selectedSessionsWithIndex={
                              selectedSessionsWithIndex
                            }
                            toggleSelectedSessionWithIndex={
                              toggleSelectedSessionWithIndex
                            }
                          />
                        )
                    )
                  )}
                </div>

                <Separator className="mt-6 hidden h-[1.5px] bg-slate-200 md:block" />

                {/* 지원 버튼 - 데스크톱 */}
                <div className="mt-6 hidden h-10 justify-end md:flex">
                  <Button
                    variant="outline"
                    className="w-30 flex h-10 items-center justify-center gap-2 rounded-md border-2 border-primary shadow"
                    onClick={onApply}
                    disabled={selectedSessionsWithIndex.length === 0}
                  >
                    <div className="flex justify-center text-base font-bold leading-normal text-primary">
                      지원하기
                    </div>
                    <ChevronRight className="h-6 w-6 text-primary" />
                  </Button>
                </div>

                {/* 지원 버튼 - 모바일 */}
                <Button
                  className="mt-6 flex h-10 w-full items-center justify-center rounded-full text-sm text-white shadow md:hidden"
                  onClick={onApply}
                  disabled={selectedSessionsWithIndex.length === 0}
                >
                  지원하기
                </Button>
              </div>
            ) : (
              <div className="col-span-2 mb-5 mt-10 flex h-6 justify-center text-lg font-medium leading-normal text-gray-500">
                참여가능한 세션이 없습니다
              </div>
            )}
          </SessionSetCard>
        </div>
      </div>
    </div>
  )
}

export default TeamDetail
