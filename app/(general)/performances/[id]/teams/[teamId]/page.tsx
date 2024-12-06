"use client"

import { Separator } from "@radix-ui/react-separator"
import { StatusCodes } from "http-status-codes"
import { ChevronRight, Maximize2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import React, { useEffect, useState } from "react"
import { RiArrowGoBackLine } from "react-icons/ri"

import Loading from "@/app/_(errors)/Loading"
import NotFoundPage from "@/app/_(errors)/NotFound"
import ApplyButton from "@/app/(general)/performances/[id]/teams/[teamId]/_components/ApplyButton"
import BasicInfo from "@/app/(general)/performances/[id]/teams/[teamId]/_components/BasicInfo"
import MemberSessionCard from "@/app/(general)/performances/[id]/teams/[teamId]/_components/MemberSessionCard"
import SessionSetCard from "@/app/(general)/performances/[id]/teams/[teamId]/_components/SessionSetCard"
import OleoPageHeader from "@/components/OleoPageHeader"
import SessionBadge from "@/components/TeamBadges/SessionBadge"
import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import ROUTES from "@/constants/routes"
import fetchData from "@/lib/fetch"
import YoutubePlayer from "@/lib/youtube/Player"
import { MemberSessionSet, SessionOrder, Team } from "@/types/Team"

interface Props {
  params: {
    id: number
    teamId: number
  }
}

const TeamDetail = ({ params }: Props) => {
  const session = useSession()
  const router = useRouter()

  const performanceId = params.id
  const id = params.teamId

  const [team, setTeam] = useState<Team | null>()
  useEffect(() => {
    if (session.data?.access) {
      fetchData(API_ENDPOINTS.TEAM.RETRIEVE(id) as ApiEndpoint, {
        cache: "no-cache",
        headers: {
          Authorization: `Bearer ${session.data?.access}`
        }
      }).then(async (res) => {
        if (!res.ok) {
          switch (res.status) {
            case StatusCodes.NOT_FOUND:
              setTeam(null)
              break
            default:
              router.push(ROUTES.HOME)
          }
        } else {
          setTeam(await res.json())
        }
      })
    }
  }, [id, session.data?.access, router])

  if (session.status === "unauthenticated") router.push(ROUTES.LOGIN)

  if (team === undefined) {
    return <Loading />
  } else if (team === null) {
    return <NotFoundPage />
  }

  const sessionsWithAtleastOneMember = new MemberSessionSet(
    team.memberSessions
  ).getSessionsWithAtleastOneMember()

  const MemberSessionsFullorNot = !team.memberSessions?.some((ms) =>
    ms.members.includes(null)
  )

  return (
    <div className="container flex w-full flex-col items-center px-0 pt-16 md:w-[1440px]">
      {/* 기울어진 배경 - 슬레이트 */}
      <div
        className="absolute left-0 top-0 z-0 h-[283px]  w-full bg-slate-300 md:h-[25rem] md:w-[1440px] min-[1440px]:w-full "
        style={{ clipPath: "polygon(0 0%, 80% 0, 180% 65%, 0% 100%)" }}
      ></div>

      {/* 기울어진 배경 - 프라이머리 */}
      <div
        className="absolute left-0 top-0 h-[283px] w-full bg-primary md:h-[28rem] md:w-[1440px] min-[1440px]:w-full "
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 60%, 0% 100%)" }}
      ></div>

      {/* 뒤로가기 버튼 및 페이지 헤더 */}
      <div className="relative flex w-full items-center justify-center px-12 md:w-[1300px]">
        {/* 뒤로가기 버튼 */}
        <Link
          href={ROUTES.PERFORMANCE.TEAM.LIST(performanceId)}
          className="absolute left-8 hidden  items-center gap-x-5 font-semibold text-white md:flex "
        >
          <RiArrowGoBackLine className="text-xl text-white" />
          <div>돌아가기</div>
        </Link>

        {/* 페이지 제목 */}
        <OleoPageHeader title="Join Your Team" className="mb-10" />
      </div>

      {/* 유튜브 임베드 */}
      <div className="relative z-10 flex w-full items-center justify-center pb-10 md:pb-[49px]">
        {team.songYoutubeVideoId && (
          <YoutubePlayer
            videoId={team.songYoutubeVideoId}
            className="mx-10 aspect-video h-auto w-full md:h-[673px] md:w-[1152px]"
          />
        )}
      </div>

      {/*수정 및 삭제*/}
      {/*
      <div className="h-auto w-full justify-items-end  pb-5  min-[878px]:w-11/12 lg:w-5/6">
        <DeleteEditButton
          performanceId={performanceId}
          team={team}
          accessToken={session.data?.access}
        />
      </div>
*/}
      <div className="flex w-full gap-[24px] max-md:flex-col max-md:items-center md:flex md:w-[1152px]">
        {/* 기본 정보 및 포스터*/}
        <div className="flex w-[93%] flex-col gap-y-[24px]">
          <BasicInfo team={team} />
          <div className="relative hidden h-[731px] w-[466px] md:block">
            <Image
              className="rounded-[20px]"
              src="/poster.png"
              alt="poster"
              width={466}
              height={731}
            />
            <div className="absolute bottom-[16px] right-[16px] flex h-11 w-11 animate-pulse items-center justify-center rounded-[10px] bg-gray-600/50">
              <Maximize2 className=" text-white" />
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
              {sessionsWithAtleastOneMember.map((ms) =>
                ms.members.map((member, index) => {
                  if (member === null) return null

                  const key = `${ms.session}-${index}`
                  return (
                    <>
                      <div className="flex flex-col">
                        <MemberSessionCard
                          key={key}
                          teamId={team.id}
                          session={ms.session}
                          sessionIndex={index + 1}
                          user={member}
                          onUnapplySuccess={setTeam}
                        />
                        <Separator className="h-[1.5px] w-full bg-slate-200" />
                      </div>
                    </>
                  )
                })
              )}
            </div>
          </SessionSetCard>
          {/* 팀 참여 신청 */}
          <SessionSetCard
            header="세션 지원"
            className="col-span-2 bg-white shadow-md"
          >
            <></>
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
            <div className=" w-full">
              <div className="grid grid-cols-2 gap-x-[26px] gap-y-[26px]">
                {team.memberSessions &&
                team.memberSessions?.length &&
                MemberSessionsFullorNot === false ? (
                  team.memberSessions?.map((ms) =>
                    ms.members.map(
                      (member, index) =>
                        member === null && (
                          <ApplyButton
                            key={`${ms.session}-${index}`}
                            teamId={team.id}
                            session={ms.session}
                            memberSessionIndex={index + 1}
                            onApplySuccess={setTeam}
                          />
                        )
                    )
                  )
                ) : (
                  <div className="col-span-2 mb-5 mt-10 flex h-[24px] w-full justify-center text-lg font-medium leading-normal text-gray-500">
                    참여가능한 세션이 없습니다
                  </div>
                )}
              </div>
              {team.memberSessions?.length && !MemberSessionsFullorNot ? (
                <Separator className="mt-[26px] hidden h-[1.5px] w-full bg-slate-200 md:block" />
              ) : null}
            </div>
            <div className=" mt-[24px] hidden h-[40px] w-full justify-end md:flex">
              <div className="inline-flex h-10 w-[120px] items-center justify-center gap-2 rounded-md border-2 border-primary bg-white px-2 py-2 shadow">
                <div className="flex justify-center text-base font-bold leading-normal text-primary">
                  지원하기
                </div>
                <ChevronRight className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-6 flex h-[40px] w-full items-center justify-center rounded-[20px] bg-primary text-sm text-white shadow md:hidden">
              지원하기
            </div>
          </SessionSetCard>
        </div>
      </div>
    </div>
  )
}

export default TeamDetail
