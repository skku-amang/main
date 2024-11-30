"use client"

import { StatusCodes } from "http-status-codes"
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

  return (
    <div className="container flex flex-col items-center pt-16">
      {/* 기울어진 배경 - 슬레이트 */}
      <div
        className="absolute left-0 top-0 z-0 h-[20rem] w-full bg-slate-300 lg:h-[25rem]"
        style={{ clipPath: "polygon(0 0%, 80% 0, 180% 65%, 0% 100%)" }}
      ></div>

      {/* 기울어진 배경 - 프라이머리 */}
      <div
        className="absolute left-0 top-0 h-[23rem] w-full bg-primary lg:h-[28rem]"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 60%, 0% 100%)" }}
      ></div>

      {/* 뒤로가기 버튼 및 페이지 헤더 */}
      <div className="relative flex w-full items-center justify-center px-12 lg:pt-4">
        {/* 뒤로가기 버튼 */}
        <Link
          href={ROUTES.PERFORMANCE.TEAM.LIST(performanceId)}
          className="absolute left-8 hidden items-center gap-x-5 font-semibold text-white md:flex"
        >
          <RiArrowGoBackLine className="hidden text-xl text-white min-[910px]:block" />
          <div className="hidden lg:block">돌아가기</div>
        </Link>

        {/* 페이지 제목 */}
        <OleoPageHeader title="Join Your Team" className="mb-10" />
      </div>

      {/* 유튜브 임베드 */}
      <div className="relative z-10 flex w-full items-center justify-center pb-5">
        {team.songYoutubeVideoId && (
          <YoutubePlayer
            videoId={team.songYoutubeVideoId}
            className="aspect-video w-4/5 max-[580px]:h-[240px] md:w-[700px] xl:w-[800px]"
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

      {/* 기본 정보 */}
      <BasicInfo team={team} />

      {/* 세션 구성 */}
      <div className="flex h-full w-full flex-col gap-y-5 py-5 min-[878px]:w-11/12  lg:w-5/6">
        {/* 세션 구성 */}
        {team.memberSessions && (
          <SessionSetCard
            header="세션구성"
            className="col-span-2 bg-white shadow-md"
          >
            <div className="flex flex-wrap gap-x-2 gap-y-2 ">
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
                        className="w-[3rem] justify-center text-base max-sm:text-[12px] sm:w-16"
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
          <div className="grid grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
            {sessionsWithAtleastOneMember.map((ms) =>
              ms.members.map((member, index) => {
                if (member === null) return
                return (
                  <MemberSessionCard
                    key={`${ms.session}-${index}`}
                    teamId={team.id}
                    session={ms.session}
                    sessionIndex={index + 1}
                    user={member}
                    onUnapplySuccess={setTeam}
                  />
                )
              })
            )}
          </div>
        </SessionSetCard>

        {/* 팀 참여 신청 */}
        <SessionSetCard
          header="팀 참여 신청"
          className="col-span-2 bg-white shadow-md"
        >
          <ul className="mb-6">
            <li>
              ・아래 버튼을 눌러 해당 팀에 참여 신청을 할 수 있으며, 선착순으로
              마감됩니다
            </li>
            <li>
              ・아래 버튼을 다시 누르거나 마이페이지에 접속하여 신청을 취소할 수
              있습니다
            </li>
          </ul>
          <div className="flex items-center justify-start gap-x-4">
            {team.memberSessions && team.memberSessions?.length > 0 ? (
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
              <div>마감</div>
            )}
          </div>
        </SessionSetCard>
      </div>
    </div>
  )
}

export default TeamDetail
