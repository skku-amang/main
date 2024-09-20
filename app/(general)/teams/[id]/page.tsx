"use client"

import Link from "next/link"
import React, { useEffect, useState } from "react"
import { RiArrowGoBackLine } from "react-icons/ri"

import ApplyButton from "@/app/(general)/teams/[id]/_components/ApplyButton"
import BasicInfo from "@/app/(general)/teams/[id]/_components/BasicInfo"
import MemberSessionCard from "@/app/(general)/teams/[id]/_components/MemberSessionCard"
import SessionSetCard from "@/app/(general)/teams/[id]/_components/SessionSetCard"
import SessionBadge from "@/components/SessionBadge"
import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import ROUTES from "@/constants/routes"
import fetchData from "@/lib/fetch"
import YoutubePlayer from "@/lib/youtube/Player"
import { MemberSessionSet, Team } from "@/types/Team"

interface Props {
  params: {
    id: number
  }
}

const TeamDetail = ({ params }: Props) => {
  const { id } = params
  const [team, setTeam] = useState<Team>()

  useEffect(() => {
    fetchData(API_ENDPOINTS.TEAM.RETRIEVE(id) as ApiEndpoint, {
      cache: "no-cache"
    })
      .then((res) => res.json())
      .then((data) => setTeam(data))
  }, [id])

  if (!team) {
    // TODO: 로딩 화면 구성
    return <div>Loading...</div>
  }

  const missingMemberSessions = new MemberSessionSet(
    team.memberSessions
  ).getSessionsWithMissingMembers()
  const satisfiedMemberSessions = new MemberSessionSet(
    team.memberSessions
  ).getSatisfiedSessions()

  return (
    <div className="container pt-16">
      <Link
        href={ROUTES.TEAM.LIST.url}
        className="flex items-center gap-x-5 font-semibold"
      >
        <RiArrowGoBackLine />
        돌아가기
      </Link>
      <h2 className="text-center text-4xl italic">Join Your Team</h2>

      {/* 유튜브 임베드 */}
      {team.songYoutubeVideoId && (
        <YoutubePlayer videoId={team.songYoutubeVideoId} />
      )}

      {/* 기본 정보 */}
      <BasicInfo team={team} />

      {/* 세션 구성 */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 세션 구성 */}
        {team.memberSessions && (
          <SessionSetCard header="세션구성">
            <div className="flex items-center gap-x-1">
              {team.memberSessions.map((ms) => (
                <SessionBadge key={ms.session} session={ms.session} />
              ))}
            </div>
          </SessionSetCard>
        )}

        {/* 신청가능한 세션 */}
        <SessionSetCard header="신청가능한 세션">
          <div className="flex items-center gap-x-1">
            {missingMemberSessions.length > 0 ? (
              missingMemberSessions.map((ms) => (
                <SessionBadge key={ms.session} session={ms.session} />
              ))
            ) : (
              <div>마감</div>
            )}
          </div>
        </SessionSetCard>

        {/* 마감된 세션 */}
        <SessionSetCard header="마감된 세션" className="col-span-2">
          <div className="mb-7 mt-3 flex items-center gap-x-1">
            {satisfiedMemberSessions.map((ms) => (
              <SessionBadge key={ms.session} session={ms.session} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-x-12 gap-y-4 lg:grid-cols-3">
            {satisfiedMemberSessions.map((ms) =>
              ms.members.map((member) => (
                <MemberSessionCard
                  key={member.id}
                  teamId={team.id}
                  session={ms.session}
                  user={member}
                  onUnapplySuccess={setTeam}
                />
              ))
            )}
          </div>
        </SessionSetCard>

        {/* 팀 참여 신청 */}
        <SessionSetCard header="팀 참여 신청" className="col-span-2">
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
            {missingMemberSessions.length > 0 ? (
              missingMemberSessions.map((ms) => (
                <ApplyButton
                  key={ms.session}
                  teamId={team.id}
                  session={ms.session}
                  onApplySuccess={setTeam}
                />
              ))
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
